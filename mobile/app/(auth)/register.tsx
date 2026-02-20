import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { alert } from '../../src/utils/alert';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { authApi } from '../../src/api/auth';
import { Colors } from '../../src/constants/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      alert('Błąd', 'Wypełnij wszystkie pola.');
      return;
    }
    if (password !== passwordConfirmation) {
      alert('Błąd', 'Hasła nie są identyczne.');
      return;
    }
    if (password.length < 8) {
      alert('Błąd', 'Hasło musi mieć co najmniej 8 znaków.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password, password_confirmation: passwordConfirmation });
      await setAuth(data.user, data.token);
      router.replace('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Nie udało się utworzyć konta.';
      alert('Błąd rejestracji', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>HouseKeep</Text>
        <Text style={styles.subtitle}>Utwórz nowe konto</Text>

        <TextInput
          style={styles.input}
          placeholder="Imię"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          style={styles.input}
          placeholder="Powtórz hasło"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Rejestracja...' : 'Zarejestruj się'}</Text>
        </TouchableOpacity>

        <View style={styles.linkRow}>
          <Text style={styles.linkText}>Masz już konto? </Text>
          <Link href="/(auth)/login" style={styles.link}>Zaloguj się</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
