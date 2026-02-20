import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { alert } from '../../../../src/utils/alert';
import { router } from 'expo-router';
import { useCreateProduct } from '../../../../src/hooks/useProducts';
import { useLocations, useCategories } from '../../../../src/hooks/useHousehold';
import { Colors } from '../../../../src/constants/colors';
import { barcodeApi } from '../../../../src/api/barcode';
import BarcodeScannerModal from '../../../../src/components/BarcodeScannerModal';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [minQuantity, setMinQuantity] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isReusable, setIsReusable] = useState(false);
  const [restockIntervalDays, setRestockIntervalDays] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const { data: locationsData } = useLocations();
  const { data: categoriesData } = useCategories();
  const createProduct = useCreateProduct();

  const locations = locationsData?.locations ?? [];
  const categories = categoriesData?.categories ?? [];

  const handleBarcodeScanned = async (scannedBarcode: string) => {
    setScannerVisible(false);
    setBarcode(scannedBarcode);
    setLookingUp(true);

    try {
      const result = await barcodeApi.lookup(scannedBarcode);
      if (result.found && result.product) {
        if (!name.trim()) {
          setName(result.product.name || '');
        }
        const label = [result.product.name, result.product.brand].filter(Boolean).join(' — ');
        alert('Znaleziono', label);
      } else {
        alert('Nie znaleziono', 'Produkt nie znaleziony w bazie. Uzupełnij dane ręcznie.');
      }
    } catch {
      // Lookup failed silently — barcode is still saved
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
      await createProduct.mutateAsync({
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
      alert('Błąd', err.response?.data?.message || 'Nie udało się dodać produktu.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nazwa *</Text>
        <TextInput style={styles.input} placeholder="np. Mleko 2%" value={name} onChangeText={setName} />

        <Text style={styles.label}>Opis</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Opcjonalny opis..." value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Cena (zł)</Text>
            <TextInput style={styles.input} placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Ilość</Text>
            <TextInput style={styles.input} placeholder="1" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.label}>Min. ilość (alert)</Text>
        <TextInput style={styles.input} placeholder="0" value={minQuantity} onChangeText={setMinQuantity} keyboardType="number-pad" />

        <Text style={styles.label}>Data ważności (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} placeholder="2025-12-31" value={expiryDate} onChangeText={setExpiryDate} />

        <Text style={styles.label}>Kod kreskowy</Text>
        <View style={styles.barcodeRow}>
          <TextInput style={[styles.input, styles.barcodeInput]} placeholder="EAN-13" value={barcode} onChangeText={setBarcode} />
          <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)} disabled={lookingUp}>
            {lookingUp ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>Skanuj</Text>
            )}
          </TouchableOpacity>
        </View>

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
            <TouchableOpacity
              key={l.id}
              style={[styles.chip, selectedLocationId === l.id && styles.chipActive]}
              onPress={() => setSelectedLocationId(l.id)}
            >
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
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(c.id)}
            >
              <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reusable toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Produkt wielorazowy</Text>
          <Switch value={isReusable} onValueChange={setIsReusable} trackColor={{ true: Colors.primaryLight }} thumbColor={isReusable ? Colors.primary : '#f4f3f4'} />
        </View>
        {isReusable && (
          <>
            <Text style={styles.label}>Interwał uzupełniania (dni)</Text>
            <TextInput style={styles.input} placeholder="np. 30" value={restockIntervalDays} onChangeText={setRestockIntervalDays} keyboardType="number-pad" />
          </>
        )}

        <TouchableOpacity style={[styles.saveButton, createProduct.isPending && styles.saveButtonDisabled]} onPress={handleSave} disabled={createProduct.isPending}>
          <Text style={styles.saveButtonText}>{createProduct.isPending ? 'Zapisywanie...' : 'Dodaj produkt'}</Text>
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
});
