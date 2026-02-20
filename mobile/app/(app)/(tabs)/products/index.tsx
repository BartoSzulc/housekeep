import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
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
          {item.price && <Text style={styles.price}>{parseFloat(item.price).toFixed(2)} zł</Text>}
          {item.is_expired && <View style={[styles.badge, styles.expiredBadge]}><Text style={styles.badgeText}>Wygasł</Text></View>}
          {!item.is_expired && item.is_expiring_soon && <View style={[styles.badge, styles.expiringBadge]}><Text style={styles.badgeText}>Wygasa</Text></View>}
          {item.is_low_stock && <View style={[styles.badge, styles.lowStockBadge]}><Text style={styles.badgeText}>Niski stan</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj produktów..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={[{ id: undefined, name: 'Wszystkie' }, ...locations.map((l) => ({ id: l.id, name: l.name }))]}
        keyExtractor={(item) => String(item.id ?? 'all')}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, selectedLocationId === item.id && styles.filterChipActive]}
            onPress={() => setSelectedLocationId(item.id as number | undefined)}
          >
            <Text style={[styles.filterChipText, selectedLocationId === item.id && styles.filterChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      />

      {/* Product List */}
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Brak produktów</Text>
              <Text style={styles.emptySubtitle}>Dodaj pierwszy produkt, aby zacząć</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/(tabs)/products/add')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 15 },
  filtersRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 13, color: Colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
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
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
