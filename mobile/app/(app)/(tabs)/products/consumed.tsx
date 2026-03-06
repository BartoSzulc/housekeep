import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useConsumedProducts, useUnconsumeProduct, useCreateProduct } from '../../../../src/hooks/useProducts';
import { Colors } from '../../../../src/constants/colors';
import { Product } from '../../../../src/types/models';
import { confirm, alert } from '../../../../src/utils/alert';

export default function ConsumedProductsScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useConsumedProducts({
    search: search || undefined,
  });
  const unconsumeProduct = useUnconsumeProduct();
  const createProduct = useCreateProduct();
  const [refreshing, setRefreshing] = useState(false);

  const products = data?.products ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleUnconsume = (product: Product) => {
    confirm('Przywroc produkt?', `Czy chcesz przywrocic "${product.name}" do aktywnych produktow?`, async () => {
      try {
        await unconsumeProduct.mutateAsync(product.id);
      } catch {
        alert('Blad', 'Nie udalo sie przywrocic produktu.');
      }
    });
  };

  const handleReAdd = (product: Product) => {
    confirm('Dodaj ponownie?', `Dodac nowy "${product.name}" z tymi samymi danymi?`, async () => {
      try {
        await createProduct.mutateAsync({
          name: product.name,
          description: product.description || undefined,
          price: product.price ? parseFloat(product.price) : undefined,
          quantity: 1,
          min_quantity: product.min_quantity || 0,
          location_id: product.location_id || undefined,
          category_id: product.category_id || undefined,
          is_reusable: product.is_reusable,
          restock_interval_days: product.restock_interval_days || undefined,
          barcode: product.barcode || undefined,
        });
        alert('Dodano', `"${product.name}" zostal dodany do produktow.`);
      } catch {
        alert('Blad', 'Nie udalo sie dodac produktu.');
      }
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <TouchableOpacity style={styles.cardLeft} onPress={() => router.push(`/(app)/(tabs)/products/${item.id}`)}>
          <Text style={styles.productName}>{item.name}</Text>
          <View style={styles.metaRow}>
            {item.location && <Text style={styles.metaTag}>{item.location.name}</Text>}
            {item.category && <Text style={[styles.metaTag, styles.categoryTag]}>{item.category.name}</Text>}
          </View>
          {item.consumed_at && (
            <Text style={styles.consumedDate}>
              Zuzyto: {new Date(item.consumed_at).toLocaleDateString('pl-PL')}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.cardRight}>
          <TouchableOpacity style={styles.reAddButton} onPress={() => handleReAdd(item)}>
            <Text style={styles.reAddButtonText}>Dodaj ponownie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreButton} onPress={() => handleUnconsume(item)}>
            <Text style={styles.restoreButtonText}>Przywroc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj zuzytych produktow..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

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
                  <Text style={styles.emptyTitle}>Brak zuzytych produktow</Text>
                  <Text style={styles.emptySubtitle}>Produkty oznaczone jako zuzyte pojawia sie tutaj</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center' },
  container: { flex: 1, width: '100%', maxWidth: 600 },
  searchRow: { paddingHorizontal: 16, paddingTop: 8 },
  searchInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 15 },
  listWrapper: { flex: 1, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  cardLeft: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  metaRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  metaTag: { fontSize: 12, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryTag: { backgroundColor: '#EEF2FF' },
  consumedDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  cardRight: { marginLeft: 12, gap: 8 },
  reAddButton: { backgroundColor: Colors.secondary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  reAddButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  restoreButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  restoreButtonText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
});
