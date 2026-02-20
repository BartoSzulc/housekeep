import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/tasks';
import { useAuthStore } from '../stores/authStore';
import { StoreTaskPayload } from '../types/api';

export function useTasks(params?: { assigned_to?: number; is_completed?: boolean }) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['tasks', householdId, params],
    queryFn: () => taskApi.list(householdId!, params),
    enabled: !!householdId,
  });
}

export function useTask(taskId: number) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['tasks', householdId, taskId],
    queryFn: () => taskApi.show(householdId!, taskId),
    enabled: !!householdId && !!taskId,
  });
}

export function useCalendar(year: number, month: number) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['calendar', householdId, year, month],
    queryFn: () => taskApi.calendar(householdId!, year, month),
    enabled: !!householdId,
  });
}

export function useCreateTask() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreTaskPayload) => taskApi.create(householdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', householdId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', householdId] });
    },
  });
}

export function useUpdateTask(taskId: number) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreTaskPayload & { is_completed: boolean }>) =>
      taskApi.update(householdId!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', householdId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', householdId] });
    },
  });
}

export function useDeleteTask() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => taskApi.delete(householdId!, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', householdId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', householdId] });
    },
  });
}

export function useCompleteTask() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...data }: { taskId: number; occurrence_date: string; notes?: string }) =>
      taskApi.complete(householdId!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', householdId] });
      queryClient.invalidateQueries({ queryKey: ['calendar', householdId] });
    },
  });
}
