import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { confirm } from '../../../../src/utils/alert';
import { router } from 'expo-router';
import { useAuthStore } from '../../../../src/stores/authStore';
import { useHousehold } from '../../../../src/hooks/useHousehold';
import { authApi } from '../../../../src/api/auth';
import { Colors } from '../../../../src/constants/colors';

export default function SettingsScreen() {
  const { user, logout: localLogout, activeHouseholdId } = useAuthStore();
  const { data: householdData } = useHousehold();
  const household = householdData?.household;

  const handleLogout = () => {
    confirm('Wylogować?', 'Czy na pewno chcesz się wylogować?', async () => {
      try {
        await authApi.logout();
      } catch {
        // ignore - token might already be invalid
      }
      await localLogout();
      router.replace('/');
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Household Info */}
      {household && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gospodarstwo</Text>
          <Text style={styles.cardValue}>{household.name}</Text>
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCodeLabel}>Kod zaproszenia:</Text>
            <Text style={styles.inviteCode}>{household.invite_code}</Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Zarządzanie</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/(tabs)/settings/locations')}>
          <Text style={styles.menuIcon}>📍</Text>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Lokalizacje</Text>
            <Text style={styles.menuItemSubtitle}>Lodówka, spiżarnia, łazienka...</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/(tabs)/settings/categories')}>
          <Text style={styles.menuIcon}>🏷️</Text>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Kategorie</Text>
            <Text style={styles.menuItemSubtitle}>Nabiał, chemia, elektronika...</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/(tabs)/settings/members')}>
          <Text style={styles.menuIcon}>👥</Text>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Członkowie</Text>
            <Text style={styles.menuItemSubtitle}>Zaproś rodzinę i współlokatorów</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj się</Text>
      </TouchableOpacity>

      <Text style={styles.version}>HouseKeep v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  section: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '600', color: Colors.text },
  userEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 24 },
  cardTitle: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '600', color: Colors.text },
  inviteCodeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  inviteCodeLabel: { fontSize: 14, color: Colors.textSecondary },
  inviteCode: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginLeft: 8, letterSpacing: 1 },
  menuSection: { marginBottom: 24 },
  menuSectionTitle: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  menuItem: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuItemContent: { flex: 1 },
  menuItemTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  menuItemSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  menuArrow: { fontSize: 24, color: Colors.textLight },
  logoutButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error, borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutButtonText: { color: Colors.error, fontSize: 16, fontWeight: '600' },
  version: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 24 },
});
