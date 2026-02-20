import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { alert } from '../../../../src/utils/alert';
import { useShoppingList, useGenerateShoppingList, useToggleShoppingItem } from '../../../../src/hooks/useShopping';
import { Colors } from '../../../../src/constants/colors';
import { Product } from '../../../../src/types/models';

export default function ShoppingListScreen() {
  const { data, isLoading, refetch } = useShoppingList();
  const generateList = useGenerateShoppingList();
  const toggleItem = useToggleShoppingItem();
  const [refreshing, setRefreshing] = useState(false);

  const items = data?.shopping_list ?? [];
  const checkedItems = items.filter((p) => !p.on_shopping_list);
  const uncheckedItems = items.filter((p) => p.on_shopping_list);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGenerate = async () => {
    try {
      const result = await generateList.mutateAsync();
      alert('Gotowe', `Dodano ${result.added_count} produktów do listy.`);
    } catch {
      alert('Błąd', 'Nie udało się wygenerować listy.');
    }
  };

  const handleToggle = (productId: number) => {
    toggleItem.mutate(productId);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleToggle(item.id)}>
      <View style={[styles.checkbox, !item.on_shopping_list && styles.checkboxDone]}>
        {!item.on_shopping_list && <Text style={styles.checkIcon}>✓</Text>}
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, !item.on_shopping_list && styles.itemNameDone]}>{item.name}</Text>
        <View style={styles.itemMeta}>
          {item.location && <Text style={styles.metaText}>{item.location.name}</Text>}
          {item.price && <Text style={styles.metaText}>{parseFloat(item.price).toFixed(2)} zł</Text>}
          <Text style={styles.metaText}>x{item.quantity}</Text>
        </View>
      </View>
      {item.is_expired && <View style={styles.expiredDot} />}
      {item.is_low_stock && <View style={styles.lowStockDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Generate button */}
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={generateList.isPending}>
        <Text style={styles.generateButtonText}>
          {generateList.isPending ? 'Generowanie...' : 'Generuj z wygasłych / niskiego stanu'}
        </Text>
      </TouchableOpacity>

      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={[...uncheckedItems, ...checkedItems]}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>Lista zakupów jest pusta</Text>
              <Text style={styles.emptySubtitle}>Wygeneruj listę lub dodaj produkty ręcznie</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Summary */}
      {items.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {uncheckedItems.length} do kupienia
            {checkedItems.length > 0 ? ` • ${checkedItems.length} kupione` : ''}
          </Text>
          {uncheckedItems.some((p) => p.price) && (
            <Text style={styles.summaryTotal}>
              ~{uncheckedItems.reduce((sum, p) => sum + (p.price ? parseFloat(p.price) * p.quantity : 0), 0).toFixed(2)} zł
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  generateButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, padding: 14, margin: 16, alignItems: 'center' },
  generateButtonText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  item: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: Colors.text },
  itemNameDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  itemMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  expiredDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.expired, marginLeft: 8 },
  lowStockDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.lowStock, marginLeft: 8 },
  separator: { height: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  summary: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryText: { fontSize: 14, color: Colors.textSecondary },
  summaryTotal: { fontSize: 16, fontWeight: '600', color: Colors.primary },
});
