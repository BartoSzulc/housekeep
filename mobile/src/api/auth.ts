import apiClient from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types/api';

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout'),

  me: () =>
    apiClient.get<{ user: import('../types/models').User }>('/auth/me').then((r) => r.data),

  updateProfile: (data: { name: string }) =>
    apiClient.put('/auth/me', data).then((r) => r.data),

  storePushToken: (token: string, platform: string) =>
    apiClient.post('/auth/push-token', { token, platform }),

  deletePushToken: (token: string) =>
    apiClient.delete('/auth/push-token', { data: { token } }),

  getVapidKey: () =>
    apiClient.get<{ key: string }>('/auth/vapid-key').then((r) => r.data),

  storeWebPushSubscription: (subscription: PushSubscriptionJSON) =>
    apiClient.post('/auth/web-push', subscription),

  deleteWebPushSubscription: (endpoint: string) =>
    apiClient.delete('/auth/web-push', { data: { endpoint } }),
};
