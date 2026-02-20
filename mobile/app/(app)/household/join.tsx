import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { alert } from '../../../src/utils/alert';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { householdApi } from '../../../src/api/households';
import { Colors } from '../../../src/constants/colors';

export default function JoinHouseholdScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const setActiveHousehold = useAuthStore((s) => s.setActiveHousehold);

  const handleJoin = async () => {
    if (!code.trim()) {
      alert('Błąd', 'Podaj kod zaproszenia.');
      return;
    }
    setLoading(true);
    try {
      const data = await householdApi.join(code.trim().toUpperCase());
      await setActiveHousehold(data.household.id);
      router.replace('/(app)/(tabs)');
    } catch (err: any) {
      alert('Błąd', err.response?.data?.message || 'Nieprawidłowy kod zaproszenia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Dołącz do gospodarstwa</Text>
        <Text style={styles.subtitle}>Wpisz kod zaproszenia otrzymany od członka gospodarstwa</Text>

        <TextInput
          style={styles.input}
          placeholder="Kod zaproszenia (np. ABC12345)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoFocus
          maxLength={12}
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleJoin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Dołączanie...' : 'Dołącz'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Wróć</Text>
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
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, textAlign: 'center', letterSpacing: 2, fontWeight: '600' },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { marginTop: 16, alignItems: 'center', padding: 12 },
  backButtonText: { color: Colors.textSecondary, fontSize: 16 },
});
