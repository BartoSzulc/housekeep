import apiClient from './client';
import { Product } from '../types/models';

export interface ShoppingListData {
  id: number;
  uuid: string;
  name: string;
  items_count?: number;
}

export interface ShoppingListItemData {
  id: number;
  shopping_list_id: number;
  product_id: number | null;
  name: string;
  quantity: number;
  is_checked: boolean;
}

export const shoppingApi = {
  list: (householdId: number) =>
    apiClient.get<{ shopping_list: Product[] }>(`/households/${householdId}/shopping-list`).then((r) => r.data),

  generate: (householdId: number) =>
    apiClient.post<{ message: string; added_count: number }>(`/households/${householdId}/shopping-list/generate`).then((r) => r.data),

  toggle: (householdId: number, productId: number) =>
    apiClient.put<{ product: Product }>(`/households/${householdId}/shopping-list/toggle/${productId}`).then((r) => r.data),

  // Named lists
  getLists: (householdId: number) =>
    apiClient.get<{ lists: ShoppingListData[] }>(`/households/${householdId}/shopping-lists`).then((r) => r.data),

  createList: (householdId: number, name: string) =>
    apiClient.post<{ list: ShoppingListData }>(`/households/${householdId}/shopping-lists`, { name }).then((r) => r.data),

  deleteList: (householdId: number, listId: number) =>
    apiClient.delete(`/households/${householdId}/shopping-lists/${listId}`).then((r) => r.data),

  getItems: (householdId: number, listId: number) =>
    apiClient.get<{ items: ShoppingListItemData[] }>(`/households/${householdId}/shopping-lists/${listId}/items`).then((r) => r.data),

  addItem: (householdId: number, listId: number, data: { name: string; quantity?: number; product_id?: number }) =>
    apiClient.post<{ item: ShoppingListItemData }>(`/households/${householdId}/shopping-lists/${listId}/items`, data).then((r) => r.data),

  toggleItem: (householdId: number, listId: number, itemId: number) =>
    apiClient.put<{ item: ShoppingListItemData }>(`/households/${householdId}/shopping-lists/${listId}/items/${itemId}`).then((r) => r.data),

  removeItem: (householdId: number, listId: number, itemId: number) =>
    apiClient.delete(`/households/${householdId}/shopping-lists/${listId}/items/${itemId}`).then((r) => r.data),
};
