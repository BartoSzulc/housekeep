import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { useExpiringProducts, useLowStockProducts } from '../../../src/hooks/useProducts';
import { useCalendar } from '../../../src/hooks/useTasks';
import { useHousehold } from '../../../src/hooks/useHousehold';
import { Colors } from '../../../src/constants/colors';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const { data: household } = useHousehold();
  const { data: expiringData, isLoading: loadingExpiring, refetch: refetchExpiring } = useExpiringProducts(7);
  const { data: lowStockData, isLoading: loadingLowStock, refetch: refetchLowStock } = useLowStockProducts();
  const { data: calendarData, isLoading: loadingCalendar, refetch: refetchCalendar } = useCalendar(now.getFullYear(), now.getMonth() + 1);
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = format(now, 'yyyy-MM-dd');
  const todayTasks = calendarData?.calendar?.filter((ct) => ct.occurrence_date === todayStr) ?? [];
  const expiringProducts = expiringData?.products ?? [];
  const lowStockProducts = lowStockData?.products ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchExpiring(), refetchLowStock(), refetchCalendar()]);
    setRefreshing(false);
  }, [refetchExpiring, refetchLowStock, refetchCalendar]);

  const isLoading = loadingExpiring || loadingLowStock || loadingCalendar;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Cześć, {user?.name?.split(' ')[0] ?? 'Użytkowniku'}!</Text>
        <Text style={styles.date}>{format(now, 'd MMMM yyyy', { locale: pl })}</Text>
        {household?.household && (
          <Text style={styles.householdName}>{household.household.name}</Text>
        )}
      </View>

      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Today's Tasks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dzisiejsze zadania</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/tasks')}>
                <Text style={styles.seeAll}>Zobacz wszystkie</Text>
              </TouchableOpacity>
            </View>
            {todayTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Brak zadań na dziś</Text>
              </View>
            ) : (
              todayTasks.slice(0, 5).map((ct, i) => (
                <TouchableOpacity key={`${ct.task.id}-${i}`} style={styles.taskCard}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ct.task.priority) }]} />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, ct.is_completed && styles.taskDone]}>{ct.task.title}</Text>
                    {ct.task.due_time && <Text style={styles.taskTime}>{ct.task.due_time.slice(0, 5)}</Text>}
                  </View>
                  {ct.is_completed && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Expiring Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wygasające produkty</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/products')}>
                <Text style={styles.seeAll}>Zobacz wszystkie</Text>
              </TouchableOpacity>
            </View>
            {expiringProducts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Brak wygasających produktów</Text>
              </View>
            ) : (
              expiringProducts.slice(0, 5).map((p) => (
                <View key={p.id} style={styles.productCard}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productLocation}>{p.location?.name ?? 'Brak lokalizacji'}</Text>
                  </View>
                  <View style={[styles.expiryBadge, p.is_expired ? styles.expiredBadge : styles.expiringSoonBadge]}>
                    <Text style={styles.expiryText}>
                      {p.is_expired ? 'Wygasł' : `Wygasa ${p.expiry_date}`}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Niski stan</Text>
                <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/shopping')}>
                  <Text style={styles.seeAll}>Lista zakupów</Text>
                </TouchableOpacity>
              </View>
              {lowStockProducts.slice(0, 5).map((p) => (
                <View key={p.id} style={styles.productCard}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productLocation}>{p.location?.name ?? ''}</Text>
                  </View>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>{p.quantity}/{p.min_quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Szybkie akcje</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/(tabs)/products/add')}>
                <Text style={styles.actionIcon}>+📦</Text>
                <Text style={styles.actionLabel}>Dodaj produkt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/(tabs)/tasks/add')}>
                <Text style={styles.actionIcon}>+📋</Text>
                <Text style={styles.actionLabel}>Dodaj zadanie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(app)/(tabs)/shopping')}>
                <Text style={styles.actionIcon}>🛒</Text>
                <Text style={styles.actionLabel}>Zakupy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function getPriorityColor(priority: number): string {
  switch (priority) {
    case 3: return Colors.priorityHigh;
    case 2: return Colors.priorityMedium;
    case 1: return Colors.priorityLow;
    default: return Colors.priorityNone;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: Colors.primary },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff' },
  date: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  householdName: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.text },
  seeAll: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 20, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  taskCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  taskDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskTime: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 18, color: Colors.success, fontWeight: '700' },
  productCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '500', color: Colors.text },
  productLocation: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  expiryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  expiredBadge: { backgroundColor: '#FEE2E2' },
  expiringSoonBadge: { backgroundColor: '#FEF3C7' },
  expiryText: { fontSize: 12, fontWeight: '500', color: Colors.text },
  stockBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stockText: { fontSize: 12, fontWeight: '500', color: Colors.lowStock },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionButton: { flex: 1, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
});
