import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { alert, confirm } from '../../../../src/utils/alert';
import { useLocalSearchParams, router } from 'expo-router';
import { useTask, useDeleteTask, useCompleteTask } from '../../../../src/hooks/useTasks';
import { Colors } from '../../../../src/constants/colors';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

const PRIORITY_LABELS: Record<number, string> = { 0: 'Brak', 1: 'Niski', 2: 'Średni', 3: 'Wysoki' };

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id, 10);
  const { data, isLoading } = useTask(taskId);
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const task = data?.task;

  const handleDelete = () => {
    confirm('Usunąć zadanie?', `Czy na pewno chcesz usunąć "${task?.title}"?`, async () => {
      try {
        await deleteTask.mutateAsync(taskId);
        router.back();
      } catch {
        alert('Błąd', 'Nie udało się usunąć zadania.');
      }
    });
  };

  const handleComplete = async () => {
    if (!task) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      await completeTask.mutateAsync({
        taskId: task.id,
        occurrence_date: task.due_date ?? today,
      });
    } catch {
      alert('Błąd', 'Nie udało się oznaczyć jako wykonane.');
    }
  };

  if (isLoading || !task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
            <Text style={styles.priorityText}>{PRIORITY_LABELS[task.priority]}</Text>
          </View>
          {task.is_recurring && <View style={styles.recurringBadge}><Text style={styles.recurringText}>Cykliczne</Text></View>}
          {task.is_completed && <View style={styles.completedBadge}><Text style={styles.completedText}>Wykonane</Text></View>}
        </View>
      </View>

      {task.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opis</Text>
          <Text style={styles.sectionText}>{task.description}</Text>
        </View>
      )}

      <View style={styles.infoGrid}>
        {task.due_date && (
          <InfoItem label="Data" value={format(new Date(task.due_date + 'T00:00:00'), 'd MMMM yyyy', { locale: pl })} />
        )}
        {task.due_time && <InfoItem label="Godzina" value={task.due_time.slice(0, 5)} />}
        {task.assigned_user && <InfoItem label="Przypisane do" value={task.assigned_user.name} />}
        {task.rrule && <InfoItem label="Reguła" value={task.rrule} />}
        {task.reminder_minutes_before != null && (
          <InfoItem label="Przypomnienie" value={formatReminder(task.reminder_minutes_before)} />
        )}
      </View>

      {/* Completions */}
      {task.completions && task.completions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historia wykonań</Text>
          {task.completions.slice(0, 10).map((c) => (
            <View key={c.id} style={styles.completionItem}>
              <Text style={styles.completionDate}>{c.occurrence_date}</Text>
              <Text style={styles.completionUser}>{c.user?.name ?? 'Nieznany'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {!task.is_completed && (
          <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={handleComplete}>
            <Text style={styles.actionButtonText}>Oznacz jako wykonane</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Usuń zadanie</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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

function formatReminder(minutes: number): string {
  if (minutes >= 1440) return `${minutes / 1440} dzień/dni`;
  if (minutes >= 60) return `${minutes / 60} godz.`;
  return `${minutes} min`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  recurringBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  recurringText: { fontSize: 12, fontWeight: '500', color: Colors.primary },
  completedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  completedText: { fontSize: 12, fontWeight: '500', color: Colors.success },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  sectionText: { fontSize: 15, color: Colors.text },
  infoGrid: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 20 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '500', color: Colors.text },
  completionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  completionDate: { fontSize: 14, color: Colors.text },
  completionUser: { fontSize: 14, color: Colors.textSecondary },
  actions: { gap: 12 },
  actionButton: { borderRadius: 12, padding: 14, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  completeButton: { backgroundColor: Colors.success },
  deleteButton: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.error },
  deleteButtonText: { color: Colors.error, fontSize: 15, fontWeight: '600' },
});
