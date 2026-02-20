import apiClient from './client';
import { CalendarResponse, TaskListResponse, TaskResponse, StoreTaskPayload } from '../types/api';
import { TaskCompletion } from '../types/models';

export const taskApi = {
  list: (householdId: number, params?: { assigned_to?: number; is_completed?: boolean }) =>
    apiClient.get<TaskListResponse>(`/households/${householdId}/tasks`, { params }).then((r) => r.data),

  show: (householdId: number, taskId: number) =>
    apiClient.get<TaskResponse>(`/households/${householdId}/tasks/${taskId}`).then((r) => r.data),

  create: (householdId: number, data: StoreTaskPayload) =>
    apiClient.post<TaskResponse>(`/households/${householdId}/tasks`, data).then((r) => r.data),

  update: (householdId: number, taskId: number, data: Partial<StoreTaskPayload & { is_completed: boolean }>) =>
    apiClient.put<TaskResponse>(`/households/${householdId}/tasks/${taskId}`, data).then((r) => r.data),

  delete: (householdId: number, taskId: number) =>
    apiClient.delete(`/households/${householdId}/tasks/${taskId}`),

  calendar: (householdId: number, year: number, month: number) =>
    apiClient.get<CalendarResponse>(`/households/${householdId}/tasks/calendar/${year}/${month}`).then((r) => r.data),

  // Completions
  complete: (householdId: number, taskId: number, data: { occurrence_date: string; notes?: string }) =>
    apiClient.post<{ completion: TaskCompletion }>(`/households/${householdId}/tasks/${taskId}/complete`, data).then((r) => r.data),

  uncomplete: (householdId: number, taskId: number, date: string) =>
    apiClient.delete(`/households/${householdId}/tasks/${taskId}/complete/${date}`),

  completions: (householdId: number, taskId: number) =>
    apiClient.get<{ completions: TaskCompletion[] }>(`/households/${householdId}/tasks/${taskId}/completions`).then((r) => r.data),
};
