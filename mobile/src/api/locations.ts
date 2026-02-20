import apiClient from './client';
import { Location } from '../types/models';

export const locationApi = {
  list: (householdId: number) =>
    apiClient.get<{ locations: Location[] }>(`/households/${householdId}/locations`).then((r) => r.data),

  create: (householdId: number, data: { name: string; icon?: string; sort_order?: number }) =>
    apiClient.post<{ location: Location }>(`/households/${householdId}/locations`, data).then((r) => r.data),

  update: (householdId: number, locationId: number, data: { name?: string; icon?: string; sort_order?: number }) =>
    apiClient.put<{ location: Location }>(`/households/${householdId}/locations/${locationId}`, data).then((r) => r.data),

  delete: (householdId: number, locationId: number) =>
    apiClient.delete(`/households/${householdId}/locations/${locationId}`),
};
