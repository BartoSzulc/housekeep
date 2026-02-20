import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { alert, confirm } from '../../../../src/utils/alert';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../../../src/hooks/useHousehold';
import { Colors } from '../../../../src/constants/colors';
import { Category } from '../../../../src/types/models';

export default function CategoriesScreen() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [newName, setNewName] = useState('');

  const categories = data?.categories ?? [];

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newName.trim() });
      setNewName('');
    } catch (err: any) {
      alert('Błąd', err.response?.data?.message || 'Nie udało się dodać kategorii.');
    }
  };

  const handleDelete = (category: Category) => {
    confirm('Usunąć?', `Usunąć "${category.name}"?`, () => deleteCategory.mutate(category.id));
  };

  return (
    <View style={styles.container}>
      {/* Add new */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Nowa kategoria..."
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={createCategory.isPending}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.products_count != null && (
                  <Text style={styles.itemCount}>{item.products_count} produktów</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Usuń</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Brak kategorii. Dodaj pierwszą powyżej.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  addRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  addInput: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 15 },
  addButton: { backgroundColor: Colors.primary, width: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: '300' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  item: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '500', color: Colors.text },
  itemCount: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  deleteText: { color: Colors.error, fontSize: 14, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
