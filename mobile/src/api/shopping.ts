import apiClient from './client';
import { Product } from '../types/models';

export const shoppingApi = {
  list: (householdId: number) =>
    apiClient.get<{ shopping_list: Product[] }>(`/households/${householdId}/shopping-list`).then((r) => r.data),

  generate: (householdId: number) =>
    apiClient.post<{ message: string; added_count: number }>(`/households/${householdId}/shopping-list/generate`).then((r) => r.data),

  toggle: (householdId: number, productId: number) =>
    apiClient.put<{ product: Product }>(`/households/${householdId}/shopping-list/toggle/${productId}`).then((r) => r.data),
};
