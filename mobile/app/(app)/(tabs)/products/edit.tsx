import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { alert } from '../../../../src/utils/alert';
import { useLocalSearchParams, router } from 'expo-router';
import { useProduct, useUpdateProduct } from '../../../../src/hooks/useProducts';
import { useLocations, useCategories } from '../../../../src/hooks/useHousehold';
import { Colors } from '../../../../src/constants/colors';
import { barcodeApi } from '../../../../src/api/barcode';
import BarcodeScannerModal from '../../../../src/components/BarcodeScannerModal';

function Toast({ message, type }: { message: string; type: 'info' | 'success' | 'error' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, []);
  const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : Colors.primary;
  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, opacity }]}>
      {type === 'info' && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id, 10);
  const { data, isLoading } = useProduct(productId);
  const updateProduct = useUpdateProduct(productId);
  const { data: locationsData } = useLocations();
  const { data: categoriesData } = useCategories();

  const product = data?.product;
  const locations = locationsData?.locations ?? [];
  const categories = categoriesData?.categories ?? [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isReusable, setIsReusable] = useState(false);
  const [restockIntervalDays, setRestockIntervalDays] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description ?? '');
      setPrice(product.price ?? '');
      setQuantity(String(product.quantity));
      setMinQuantity(String(product.min_quantity));
      setExpiryDate(product.expiry_date ?? '');
      setBarcode(product.barcode ?? '');
      setIsReusable(product.is_reusable);
      setRestockIntervalDays(product.restock_interval_days ? String(product.restock_interval_days) : '');
      setSelectedLocationId(product.location_id ?? undefined);
      setSelectedCategoryId(product.category_id ?? undefined);
    }
  }, [product]);

  const showToast = (message: string, type: 'info' | 'success' | 'error', duration = 3000) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    if (type !== 'info') {
      toastTimer.current = setTimeout(() => setToast(null), duration);
    }
  };

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    setScannerVisible(false);
    setBarcode(scannedBarcode);
    setLookingUp(true);
    showToast(`Szukam: ${scannedBarcode}...`, 'info');

    try {
      const result = await barcodeApi.lookup(scannedBarcode);
      if (result.found && result.product) {
        if (!name.trim()) {
          setName(result.product.name || '');
        }
        const label = [result.product.name, result.product.brand].filter(Boolean).join(' — ');
        showToast(label, 'success', 4000);
      } else {
        showToast('Nie znaleziono w bazie. Uzupełnij ręcznie.', 'error', 4000);
      }
    } catch {
      showToast('Błąd połączenia. Kod zapisany.', 'error', 4000);
    } finally {
      setLookingUp(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Błąd', 'Podaj nazwę produktu.');
      return;
    }

    try {
      await updateProduct.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        quantity: parseInt(quantity, 10) || 1,
        min_quantity: parseInt(minQuantity, 10) || 0,
        expiry_date: expiryDate || undefined,
        barcode: barcode.trim() || undefined,
        is_reusable: isReusable,
        restock_interval_days: restockIntervalDays ? parseInt(restockIntervalDays, 10) : undefined,
        location_id: selectedLocationId,
        category_id: selectedCategoryId,
      });
      router.back();
    } catch (err: any) {
      alert('Błąd', err.response?.data?.message || 'Nie udało się zaktualizować produktu.');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nazwa *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Opis</Text>
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Cena (zł)</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Ilość</Text>
            <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.label}>Min. ilość (alert)</Text>
        <TextInput style={styles.input} value={minQuantity} onChangeText={setMinQuantity} keyboardType="number-pad" />

        <Text style={styles.label}>Data ważności (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} />

        <Text style={styles.label}>Kod kreskowy</Text>
        <View style={styles.barcodeRow}>
          <TextInput style={[styles.input, styles.barcodeInput]} value={barcode} onChangeText={setBarcode} />
          <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)} disabled={lookingUp}>
            {lookingUp ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>Skanuj</Text>
            )}
          </TouchableOpacity>
        </View>
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* Location Picker */}
        <Text style={styles.label}>Lokalizacja</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedLocationId && styles.chipActive]}
            onPress={() => setSelectedLocationId(undefined)}
          >
            <Text style={[styles.chipText, !selectedLocationId && styles.chipTextActive]}>Brak</Text>
          </TouchableOpacity>
          {locations.map((l) => (
            <TouchableOpacity key={l.id} style={[styles.chip, selectedLocationId === l.id && styles.chipActive]} onPress={() => setSelectedLocationId(l.id)}>
              <Text style={[styles.chipText, selectedLocationId === l.id && styles.chipTextActive]}>{l.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Picker */}
        <Text style={styles.label}>Kategoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategoryId && styles.chipActive]}
            onPress={() => setSelectedCategoryId(undefined)}
          >
            <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>Brak</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity key={c.id} style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]} onPress={() => setSelectedCategoryId(c.id)}>
              <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Produkt wielorazowy</Text>
          <Switch value={isReusable} onValueChange={setIsReusable} trackColor={{ true: Colors.primaryLight }} thumbColor={isReusable ? Colors.primary : '#f4f3f4'} />
        </View>
        {isReusable && (
          <>
            <Text style={styles.label}>Interwał uzupełniania (dni)</Text>
            <TextInput style={styles.input} value={restockIntervalDays} onChangeText={setRestockIntervalDays} keyboardType="number-pad" />
          </>
        )}

        <TouchableOpacity style={[styles.saveButton, updateProduct.isPending && styles.saveButtonDisabled]} onPress={handleSave} disabled={updateProduct.isPending}>
          <Text style={styles.saveButtonText}>{updateProduct.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BarcodeScannerModal
        visible={scannerVisible}
        onScanned={handleBarcodeScanned}
        onClose={() => setScannerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  barcodeRow: { flexDirection: 'row', gap: 8 },
  barcodeInput: { flex: 1 },
  scanButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  scanButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  saveButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toast: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, marginTop: 10 },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
});
