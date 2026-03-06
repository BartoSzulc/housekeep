import apiClient from './client';
import { ProductListResponse, ProductResponse, StoreProductPayload } from '../types/api';
import { PriceHistoryEntry } from '../types/models';

export const productApi = {
  list: (householdId: number, params?: { location_id?: number; category_id?: number; search?: string }) =>
    apiClient.get<ProductListResponse>(`/households/${householdId}/products`, { params }).then((r) => r.data),

  show: (householdId: number, productId: number) =>
    apiClient.get<ProductResponse>(`/households/${householdId}/products/${productId}`).then((r) => r.data),

  create: (householdId: number, data: StoreProductPayload) =>
    apiClient.post<ProductResponse>(`/households/${householdId}/products`, data).then((r) => r.data),

  update: (householdId: number, productId: number, data: Partial<StoreProductPayload>) =>
    apiClient.put<ProductResponse>(`/households/${householdId}/products/${productId}`, data).then((r) => r.data),

  delete: (householdId: number, productId: number) =>
    apiClient.delete(`/households/${householdId}/products/${productId}`),

  expiring: (householdId: number, days = 3) =>
    apiClient.get<{ products: import('../types/models').Product[] }>(`/households/${householdId}/products/expiring`, { params: { days } }).then((r) => r.data),

  lowStock: (householdId: number) =>
    apiClient.get<{ products: import('../types/models').Product[] }>(`/households/${householdId}/products/low-stock`).then((r) => r.data),

  restock: (householdId: number, productId: number, data: { quantity: number; price?: number; store?: string }) =>
    apiClient.post<ProductResponse>(`/households/${householdId}/products/${productId}/restock`, data).then((r) => r.data),

  consume: (householdId: number, productId: number) =>
    apiClient.post<ProductResponse>(`/households/${householdId}/products/${productId}/consume`).then((r) => r.data),

  unconsume: (householdId: number, productId: number) =>
    apiClient.post<ProductResponse>(`/households/${householdId}/products/${productId}/unconsume`).then((r) => r.data),

  consumed: (householdId: number, params?: { search?: string }) =>
    apiClient.get<ProductListResponse>(`/households/${householdId}/products/consumed`, { params }).then((r) => r.data),

  // Price History
  priceHistory: (householdId: number, productId: number) =>
    apiClient.get<{ price_history: PriceHistoryEntry[] }>(`/households/${householdId}/products/${productId}/prices`).then((r) => r.data),

  addPrice: (householdId: number, productId: number, data: { price: number; store?: string; recorded_at?: string }) =>
    apiClient.post(`/households/${householdId}/products/${productId}/prices`, data).then((r) => r.data),
};
