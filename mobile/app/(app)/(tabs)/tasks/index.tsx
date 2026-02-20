import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { router } from 'expo-router';
import { useCalendar, useCompleteTask } from '../../../../src/hooks/useTasks';
import { Colors } from '../../../../src/constants/colors';
import { CalendarTask } from '../../../../src/types/models';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function TasksCalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(format(now, 'yyyy-MM-dd'));
  const { data, isLoading, refetch } = useCalendar(year, month);
  const completeTask = useCompleteTask();
  const [refreshing, setRefreshing] = useState(false);

  const calendarTasks = data?.calendar ?? [];

  // Build marked dates for the calendar
  const markedDates: Record<string, any> = {};
  calendarTasks.forEach((ct) => {
    const date = ct.occurrence_date;
    if (!markedDates[date]) {
      markedDates[date] = { dots: [] };
    }
    const color = getPriorityColor(ct.task.priority);
    if (!markedDates[date].dots.some((d: any) => d.color === color)) {
      markedDates[date].dots.push({ key: `${ct.task.id}`, color });
    }
  });

  // Mark selected date
  if (markedDates[selectedDate]) {
    markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: Colors.primary };
  } else {
    markedDates[selectedDate] = { selected: true, selectedColor: Colors.primary, dots: [] };
  }

  // Tasks for selected date
  const dayTasks = calendarTasks.filter((ct) => ct.occurrence_date === selectedDate);

  const onMonthChange = (date: DateData) => {
    setYear(date.year);
    setMonth(date.month);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleToggleComplete = async (ct: CalendarTask) => {
    try {
      await completeTask.mutateAsync({
        taskId: ct.task.id,
        occurrence_date: ct.occurrence_date,
      });
    } catch {
      // silently fail
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        onMonthChange={onMonthChange}
        theme={{
          calendarBackground: Colors.surface,
          todayTextColor: Colors.primary,
          selectedDayBackgroundColor: Colors.primary,
          arrowColor: Colors.primary,
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textMonthFontWeight: '600' as any,
        }}
      />

      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>
          {format(new Date(selectedDate + 'T00:00:00'), 'd MMMM yyyy', { locale: pl })}
        </Text>
        <Text style={styles.dayCount}>{dayTasks.length} zadań</Text>
      </View>

      {isLoading && !refreshing ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={dayTasks}
          keyExtractor={(item, i) => `${item.task.id}-${i}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.taskCard}
              onPress={() => router.push(`/(app)/(tabs)/tasks/${item.task.id}`)}
            >
              <TouchableOpacity
                style={[styles.checkbox, item.is_completed && styles.checkboxDone]}
                onPress={() => handleToggleComplete(item)}
              >
                {item.is_completed && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.is_completed && styles.taskTitleDone]}>
                  {item.task.title}
                </Text>
                <View style={styles.taskMeta}>
                  {item.task.due_time && <Text style={styles.taskTime}>{item.task.due_time.slice(0, 5)}</Text>}
                  {item.task.is_recurring && <Text style={styles.recurringTag}>Cykliczne</Text>}
                  {item.task.assigned_user && <Text style={styles.assignedTag}>{item.task.assigned_user.name}</Text>}
                </View>
              </View>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.task.priority) }]} />
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Brak zadań na ten dzień</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/(app)/(tabs)/tasks/add', params: { date: selectedDate } })}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
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
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  dayTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  dayCount: { fontSize: 14, color: Colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  taskCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkIcon: { color: '#fff', fontSize: 14, fontWeight: '700' },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: Colors.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.textSecondary },
  taskMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  taskTime: { fontSize: 12, color: Colors.textSecondary },
  recurringTag: { fontSize: 12, color: Colors.primary, backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  assignedTag: { fontSize: 12, color: Colors.textSecondary },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  empty: { alignItems: 'center', paddingTop: 30 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
