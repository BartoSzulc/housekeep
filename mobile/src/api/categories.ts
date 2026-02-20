import apiClient from './client';
import { Category } from '../types/models';

export const categoryApi = {
  list: (householdId: number) =>
    apiClient.get<{ categories: Category[] }>(`/households/${householdId}/categories`).then((r) => r.data),

  create: (householdId: number, data: { name: string; color?: string; icon?: string }) =>
    apiClient.post<{ category: Category }>(`/households/${householdId}/categories`, data).then((r) => r.data),

  update: (householdId: number, categoryId: number, data: { name?: string; color?: string; icon?: string }) =>
    apiClient.put<{ category: Category }>(`/households/${householdId}/categories/${categoryId}`, data).then((r) => r.data),

  delete: (householdId: number, categoryId: number) =>
    apiClient.delete(`/households/${householdId}/categories/${categoryId}`),
};
