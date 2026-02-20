import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdApi } from '../api/households';
import { locationApi } from '../api/locations';
import { categoryApi } from '../api/categories';
import { useAuthStore } from '../stores/authStore';

export function useHousehold() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['household', householdId],
    queryFn: () => householdApi.show(householdId!),
    enabled: !!householdId,
  });
}

export function useMembers() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['members', householdId],
    queryFn: () => householdApi.members(householdId!),
    enabled: !!householdId,
  });
}

export function useLocations() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['locations', householdId],
    queryFn: () => locationApi.list(householdId!),
    enabled: !!householdId,
  });
}

export function useCategories() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['categories', householdId],
    queryFn: () => categoryApi.list(householdId!),
    enabled: !!householdId,
  });
}

export function useCreateLocation() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; icon?: string; sort_order?: number }) =>
      locationApi.create(householdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', householdId] });
    },
  });
}

export function useDeleteLocation() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: number) => locationApi.delete(householdId!, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', householdId] });
    },
  });
}

export function useCreateCategory() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string; icon?: string }) =>
      categoryApi.create(householdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', householdId] });
    },
  });
}

export function useDeleteCategory() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: number) => categoryApi.delete(householdId!, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', householdId] });
    },
  });
}

export function useCreateInvite() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email?: string) => householdApi.createInvite(householdId!, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household', householdId] });
    },
  });
}
