import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { alert, confirm } from '../../../../src/utils/alert';
import { useLocalSearchParams, router } from 'expo-router';
import { useProduct, useDeleteProduct, useRestockProduct } from '../../../../src/hooks/useProducts';
import { Colors } from '../../../../src/constants/colors';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id, 10);
  const { data, isLoading } = useProduct(productId);
  const deleteProduct = useDeleteProduct();
  const restockProduct = useRestockProduct();
  const product = data?.product;

  const handleDelete = () => {
    confirm('Usunąć produkt?', `Czy na pewno chcesz usunąć "${product?.name}"?`, async () => {
      try {
        await deleteProduct.mutateAsync(productId);
        router.back();
      } catch {
        alert('Błąd', 'Nie udało się usunąć produktu.');
      }
    });
  };

  const handleRestock = () => {
    Alert.prompt?.(
      'Uzupełnij zapas',
      'Podaj ilość:',
      (text: string) => {
        const qty = parseInt(text, 10);
        if (qty > 0) {
          restockProduct.mutate({ productId, quantity: qty });
        }
      }
    ) || alert('Uzupełnij zapas', 'Funkcja dostępna w pełnej wersji');
  };

  if (isLoading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.badgeRow}>
          {product.is_expired && <View style={[styles.badge, styles.expiredBadge]}><Text style={styles.badgeText}>Wygasły</Text></View>}
          {!product.is_expired && product.is_expiring_soon && <View style={[styles.badge, styles.expiringBadge]}><Text style={styles.badgeText}>Wygasa wkrótce</Text></View>}
          {product.is_low_stock && <View style={[styles.badge, styles.lowStockBadge]}><Text style={styles.badgeText}>Niski stan</Text></View>}
          {product.is_reusable && <View style={[styles.badge, styles.reusableBadge]}><Text style={styles.badgeText}>Wielorazowy</Text></View>}
        </View>
      </View>

      {product.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis</Text>
          <Text style={styles.sectionText}>{product.description}</Text>
        </View>
      )}

      <View style={styles.infoGrid}>
        <InfoItem label="Ilość" value={`${product.quantity}${product.min_quantity > 0 ? ` / min. ${product.min_quantity}` : ''}`} />
        {product.price && <InfoItem label="Cena" value={`${parseFloat(product.price).toFixed(2)} zł`} />}
        {product.expiry_date && <InfoItem label="Data ważności" value={product.expiry_date} />}
        {product.location && <InfoItem label="Lokalizacja" value={product.location.name} />}
        {product.category && <InfoItem label="Kategoria" value={product.category.name} />}
        {product.barcode && <InfoItem label="Kod kreskowy" value={product.barcode} />}
        {product.restock_interval_days && <InfoItem label="Interwał uzupełniania" value={`${product.restock_interval_days} dni`} />}
        {product.last_restocked_at && <InfoItem label="Ostatnie uzupełnienie" value={product.last_restocked_at} />}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '/(app)/(tabs)/products/edit', params: { id: product.id } })}>
          <Text style={styles.actionButtonText}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.restockButton]} onPress={handleRestock}>
          <Text style={[styles.actionButtonText, styles.restockButtonText]}>Uzupełnij</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Usuń</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  productName: { fontSize: 24, fontWeight: '700', color: Colors.text },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  expiredBadge: { backgroundColor: '#FEE2E2' },
  expiringBadge: { backgroundColor: '#FEF3C7' },
  lowStockBadge: { backgroundColor: '#FFF7ED' },
  reusableBadge: { backgroundColor: '#EEF2FF' },
  badgeText: { fontSize: 12, fontWeight: '500', color: Colors.text },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  sectionText: { fontSize: 15, color: Colors.text },
  infoGrid: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 20 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '500', color: Colors.text },
  actions: { gap: 12 },
  actionButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  restockButton: { backgroundColor: Colors.secondary },
  restockButtonText: { color: '#fff' },
  deleteButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error },
  deleteButtonText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});
