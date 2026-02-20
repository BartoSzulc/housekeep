import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { alert } from '../../../src/utils/alert';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { householdApi } from '../../../src/api/households';
import { Colors } from '../../../src/constants/colors';

export default function CreateHouseholdScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const setActiveHousehold = useAuthStore((s) => s.setActiveHousehold);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Błąd', 'Podaj nazwę gospodarstwa.');
      return;
    }
    setLoading(true);
    try {
      const data = await householdApi.create(name.trim());
      await setActiveHousehold(data.household.id);
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      alert('Błąd', err.response?.data?.message || 'Nie udało się utworzyć gospodarstwa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Witaj w HouseKeep!</Text>
        <Text style={styles.subtitle}>Utwórz gospodarstwo domowe, aby zacząć</Text>

        <TextInput
          style={styles.input}
          placeholder="Nazwa gospodarstwa (np. Dom Kowalskich)"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Tworzenie...' : 'Utwórz gospodarstwo'}</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>lub</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(app)/household/join')}>
          <Text style={styles.secondaryButtonText}>Dołącz do istniejącego</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 16, color: Colors.textSecondary, fontSize: 14 },
  secondaryButton: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  secondaryButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});
