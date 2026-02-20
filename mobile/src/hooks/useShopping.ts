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
