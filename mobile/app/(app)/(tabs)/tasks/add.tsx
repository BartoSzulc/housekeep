import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { alert } from '../../../../src/utils/alert';
import { useLocalSearchParams, router } from 'expo-router';
import { useCreateTask } from '../../../../src/hooks/useTasks';
import { useMembers } from '../../../../src/hooks/useHousehold';
import { Colors } from '../../../../src/constants/colors';

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Brak', color: Colors.priorityNone },
  { value: 1, label: 'Niski', color: Colors.priorityLow },
  { value: 2, label: 'Średni', color: Colors.priorityMedium },
  { value: 3, label: 'Wysoki', color: Colors.priorityHigh },
];

const RECURRENCE_OPTIONS = [
  { label: 'Codziennie', rrule: 'FREQ=DAILY' },
  { label: 'Co tydzień', rrule: 'FREQ=WEEKLY' },
  { label: 'Co 2 tygodnie', rrule: 'FREQ=WEEKLY;INTERVAL=2' },
  { label: 'Co miesiąc', rrule: 'FREQ=MONTHLY' },
  { label: 'Co rok', rrule: 'FREQ=YEARLY' },
];

const REMINDER_OPTIONS = [
  { label: 'Brak', value: null },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 godz', value: 60 },
  { label: '1 dzień', value: 1440 },
];

export default function AddTaskScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(date ?? '');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState(0);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedRRule, setSelectedRRule] = useState('FREQ=WEEKLY');
  const [assignedTo, setAssignedTo] = useState<number | undefined>();
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);

  const createTask = useCreateTask();
  const { data: membersData } = useMembers();
  const members = membersData?.members ?? [];

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Błąd', 'Podaj tytuł zadania.');
      return;
    }

    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        due_time: dueTime || undefined,
        priority,
        is_recurring: isRecurring,
        rrule: isRecurring ? selectedRRule : undefined,
        assigned_to: assignedTo,
        reminder_minutes_before: reminderMinutes ?? undefined,
      });
      router.back();
    } catch (err: any) {
      alert('Błąd', err.response?.data?.message || 'Nie udało się dodać zadania.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tytuł *</Text>
        <TextInput style={styles.input} placeholder="np. Wynieść śmieci" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Opis</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Opcjonalny opis..." value={description} onChangeText={setDescription} multiline numberOfLines={3} />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} placeholder="2025-12-31" value={dueDate} onChangeText={setDueDate} />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Godzina (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="14:00" value={dueTime} onChangeText={setDueTime} />
          </View>
        </View>

        {/* Priority */}
        <Text style={styles.label}>Priorytet</Text>
        <View style={styles.optionsRow}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.priorityChip, priority === opt.value && { backgroundColor: opt.color, borderColor: opt.color }]}
              onPress={() => setPriority(opt.value)}
            >
              <Text style={[styles.priorityChipText, priority === opt.value && styles.priorityChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assigned To */}
        {members.length > 0 && (
          <>
            <Text style={styles.label}>Przypisz do</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, !assignedTo && styles.chipActive]}
                onPress={() => setAssignedTo(undefined)}
              >
                <Text style={[styles.chipText, !assignedTo && styles.chipTextActive]}>Nikt</Text>
              </TouchableOpacity>
              {members.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.chip, assignedTo === m.id && styles.chipActive]}
                  onPress={() => setAssignedTo(m.id)}
                >
                  <Text style={[styles.chipText, assignedTo === m.id && styles.chipTextActive]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Recurring */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Zadanie cykliczne</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: Colors.primaryLight }} thumbColor={isRecurring ? Colors.primary : '#f4f3f4'} />
        </View>
        {isRecurring && (
          <View style={styles.optionsRow}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.rrule}
                style={[styles.chip, selectedRRule === opt.rrule && styles.chipActive]}
                onPress={() => setSelectedRRule(opt.rrule)}
              >
                <Text style={[styles.chipText, selectedRRule === opt.rrule && styles.chipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Reminder */}
        <Text style={styles.label}>Przypomnienie</Text>
        <View style={styles.optionsRow}>
          {REMINDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={[styles.chip, reminderMinutes === opt.value && styles.chipActive]}
              onPress={() => setReminderMinutes(opt.value)}
            >
              <Text style={[styles.chipText, reminderMinutes === opt.value && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveButton, createTask.isPending && styles.saveButtonDisabled]} onPress={handleSave} disabled={createTask.isPending}>
          <Text style={styles.saveButtonText}>{createTask.isPending ? 'Zapisywanie...' : 'Dodaj zadanie'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },
  priorityChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  priorityChipText: { fontSize: 13, color: Colors.textSecondary },
  priorityChipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  saveButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
