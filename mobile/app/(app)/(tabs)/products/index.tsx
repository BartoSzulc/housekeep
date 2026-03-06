import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useProducts } from '../../../../src/hooks/useProducts';
import { useLocations, useCategories } from '../../../../src/hooks/useHousehold';
import { Colors } from '../../../../src/constants/colors';
import { Product } from '../../../../src/types/models';

export default function ProductListScreen() {
  const [search, setSearch] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();

  const { data, isLoading, refetch } = useProducts({
    search: search || undefined,
    location_id: selectedLocationId,
    category_id: selectedCategoryId,
  });
  const { data: locationsData } = useLocations();
  const { data: categoriesData } = useCategories();
  const [refreshing, setRefreshing] = useState(false);

  const products = data?.products ?? [];
  const locations = locationsData?.locations ?? [];
  const categories = categoriesData?.categories ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/(tabs)/products/${item.id}`)}>
      <View style={styles.cardBody}>
        <View style={styles.cardLeft}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.metaRow}>
            {item.location && <Text style={styles.metaTag}>{item.location.name}</Text>}
            {item.category && <Text style={[styles.metaTag, styles.categoryTag]}>{item.category.name}</Text>}
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.quantity}>x{item.quantity}</Text>
          {item.price && <Text style={styles.price}>{parseFloat(item.price).toFixed(2)} zl</Text>}
          {item.is_expired && <View style={[styles.badge, styles.expiredBadge]}><Text style={styles.badgeText}>Wygasl</Text></View>}
          {!item.is_expired && item.is_expiring_soon && <View style={[styles.badge, styles.expiringBadge]}><Text style={styles.badgeText}>Wygasa</Text></View>}
          {item.is_low_stock && <View style={[styles.badge, styles.lowStockBadge]}><Text style={styles.badgeText}>Niski stan</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Sticky header: search + filters */}
        <View style={styles.stickyHeader}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Szukaj produktow..."
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {[{ id: undefined as number | undefined, name: 'Wszystkie' }, ...locations.map((l) => ({ id: l.id as number | undefined, name: l.name }))].map((item) => (
              <TouchableOpacity
                key={String(item.id ?? 'all')}
                style={[styles.filterChip, selectedLocationId === item.id && styles.filterChipActive]}
                onPress={() => setSelectedLocationId(item.id)}
              >
                <Text style={[styles.filterChipText, selectedLocationId === item.id && styles.filterChipTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product List */}
        <View style={styles.listWrapper}>
          {isLoading && !refreshing ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderProduct}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>Brak produktow</Text>
                  <Text style={styles.emptySubtitle}>Dodaj pierwszy produkt, aby zaczac</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Archive button */}
        <TouchableOpacity style={styles.archiveButton} onPress={() => router.push('/(app)/(tabs)/products/consumed')}>
          <Text style={styles.archiveButtonText}>Zuzyte</Text>
        </TouchableOpacity>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/(tabs)/products/add')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 600 },
  stickyHeader: { backgroundColor: Colors.background, zIndex: 10 },
  searchRow: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 15 },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  listWrapper: { flex: 1, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', padding: 16 },
  cardLeft: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  metaRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  metaTag: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTag: { backgroundColor: '#EEF2FF' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  quantity: { fontSize: 16, fontWeight: '600', color: Colors.text },
  price: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  expiredBadge: { backgroundColor: '#FEE2E2' },
  expiringBadge: { backgroundColor: '#FEF3C7' },
  lowStockBadge: { backgroundColor: '#FFF7ED' },
  badgeText: { fontSize: 11, fontWeight: '500', color: Colors.text },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  archiveButton: { position: 'absolute', left: 20, bottom: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  archiveButtonText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
