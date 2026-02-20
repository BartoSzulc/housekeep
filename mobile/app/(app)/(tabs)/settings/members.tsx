import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { useMembers, useHousehold, useCreateInvite } from '../../../../src/hooks/useHousehold';
import { useAuthStore } from '../../../../src/stores/authStore';
import { Colors } from '../../../../src/constants/colors';
import { HouseholdMember } from '../../../../src/types/models';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Właściciel',
  admin: 'Admin',
  member: 'Członek',
};

export default function MembersScreen() {
  const { data: membersData, isLoading } = useMembers();
  const { data: householdData } = useHousehold();
  const createInvite = useCreateInvite();
  const userId = useAuthStore((s) => s.user?.id);

  const members = membersData?.members ?? [];
  const household = householdData?.household;

  const handleInvite = async () => {
    try {
      await createInvite.mutateAsync();
      if (household?.invite_code) {
        await Share.share({
          message: `Dołącz do mojego gospodarstwa "${household.name}" w HouseKeep! Kod zaproszenia: ${household.invite_code}`,
        });
      }
    } catch {
      // user cancelled share
    }
  };

  const handleShareCode = async () => {
    if (!household?.invite_code) return;
    try {
      await Share.share({
        message: `Dołącz do mojego gospodarstwa "${household.name}" w HouseKeep! Kod zaproszenia: ${household.invite_code}`,
      });
    } catch {
      // user cancelled
    }
  };

  const renderMember = ({ item }: { item: HouseholdMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.name} {item.id === userId ? '(Ty)' : ''}
        </Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      <View style={[styles.roleBadge, item.role === 'owner' && styles.ownerBadge]}>
        <Text style={[styles.roleText, item.role === 'owner' && styles.ownerText]}>
          {ROLE_LABELS[item.role] ?? item.role}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Invite Section */}
      <View style={styles.inviteSection}>
        <Text style={styles.inviteTitle}>Zaproś członka</Text>
        {household?.invite_code && (
          <TouchableOpacity style={styles.codeBox} onPress={handleShareCode}>
            <Text style={styles.codeLabel}>Kod zaproszenia:</Text>
            <Text style={styles.codeValue}>{household.invite_code}</Text>
            <Text style={styles.codeTap}>Kliknij, aby udostępnić</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite} disabled={createInvite.isPending}>
          <Text style={styles.inviteButtonText}>
            {createInvite.isPending ? 'Tworzenie...' : 'Udostępnij zaproszenie'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Members List */}
      <Text style={styles.sectionTitle}>Członkowie ({members.length})</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Brak członków</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inviteSection: { padding: 16, backgroundColor: Colors.surface, marginBottom: 16 },
  inviteTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  codeBox: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  codeLabel: { fontSize: 12, color: Colors.textSecondary },
  codeValue: { fontSize: 24, fontWeight: '700', color: Colors.primary, letterSpacing: 2, marginVertical: 4 },
  codeTap: { fontSize: 12, color: Colors.textLight },
  inviteButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  inviteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, paddingHorizontal: 16, marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  memberCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '500', color: Colors.text },
  memberEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ownerBadge: { backgroundColor: '#EEF2FF' },
  roleText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  ownerText: { color: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
