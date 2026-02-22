import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingApi } from '../api/shopping';
import { useAuthStore } from '../stores/authStore';

export function useShoppingList() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['shopping', householdId],
    queryFn: () => shoppingApi.list(householdId!),
    enabled: !!householdId,
  });
}

export function useGenerateShoppingList() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => shoppingApi.generate(householdId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', householdId] });
      queryClient.invalidateQueries({ queryKey: ['products', householdId] });
    },
  });
}

export function useToggleShoppingItem() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => shoppingApi.toggle(householdId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', householdId] });
    },
  });
}

// Named lists
export function useNamedLists() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['shopping-lists', householdId],
    queryFn: () => shoppingApi.getLists(householdId!),
    enabled: !!householdId,
  });
}

export function useCreateNamedList() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => shoppingApi.createList(householdId!, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-lists', householdId] }),
  });
}

export function useDeleteNamedList() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: number) => shoppingApi.deleteList(householdId!, listId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-lists', householdId] }),
  });
}

export function useNamedListItems(listId: number | null) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['shopping-list-items', householdId, listId],
    queryFn: () => shoppingApi.getItems(householdId!, listId!),
    enabled: !!householdId && !!listId,
  });
}

export function useAddNamedListItem(listId: number | null) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; quantity?: number; product_id?: number }) =>
      shoppingApi.addItem(householdId!, listId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-list-items', householdId, listId] }),
  });
}

export function useToggleNamedListItem(listId: number | null) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => shoppingApi.toggleItem(householdId!, listId!, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-list-items', householdId, listId] }),
  });
}

export function useRemoveNamedListItem(listId: number | null) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => shoppingApi.removeItem(householdId!, listId!, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping-list-items', householdId, listId] }),
  });
}
