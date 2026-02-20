import apiClient from './client';
import { HouseholdResponse } from '../types/api';
import { HouseholdMember, Invite } from '../types/models';

export const householdApi = {
  create: (name: string) =>
    apiClient.post<HouseholdResponse>('/households', { name }).then((r) => r.data),

  join: (invite_code: string) =>
    apiClient.post<HouseholdResponse>('/households/join', { invite_code }).then((r) => r.data),

  show: (id: number) =>
    apiClient.get<HouseholdResponse>(`/households/${id}`).then((r) => r.data),

  update: (id: number, name: string) =>
    apiClient.put<HouseholdResponse>(`/households/${id}`, { name }).then((r) => r.data),

  members: (id: number) =>
    apiClient.get<{ members: HouseholdMember[] }>(`/households/${id}/members`).then((r) => r.data),

  removeMember: (householdId: number, userId: number) =>
    apiClient.delete(`/households/${householdId}/members/${userId}`),

  // Invites
  getInvites: (householdId: number) =>
    apiClient.get<{ invites: Invite[] }>(`/households/${householdId}/invites`).then((r) => r.data),

  createInvite: (householdId: number, email?: string) =>
    apiClient.post<{ invite: Invite }>(`/households/${householdId}/invites`, { email }).then((r) => r.data),

  acceptInvite: (token: string) =>
    apiClient.post<HouseholdResponse>(`/invites/${token}/accept`).then((r) => r.data),
};
