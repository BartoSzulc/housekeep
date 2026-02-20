import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/products';
import { useAuthStore } from '../stores/authStore';
import { StoreProductPayload } from '../types/api';

export function useProducts(params?: { location_id?: number; category_id?: number; search?: string }) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['products', householdId, params],
    queryFn: () => productApi.list(householdId!, params),
    enabled: !!householdId,
  });
}

export function useProduct(productId: number) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['products', householdId, productId],
    queryFn: () => productApi.show(householdId!, productId),
    enabled: !!householdId && !!productId,
  });
}

export function useExpiringProducts(days = 3) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['products', 'expiring', householdId, days],
    queryFn: () => productApi.expiring(householdId!, days),
    enabled: !!householdId,
  });
}

export function useLowStockProducts() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  return useQuery({
    queryKey: ['products', 'lowStock', householdId],
    queryFn: () => productApi.lowStock(householdId!),
    enabled: !!householdId,
  });
}

export function useCreateProduct() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreProductPayload) => productApi.create(householdId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', householdId] });
    },
  });
}

export function useUpdateProduct(productId: number) {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreProductPayload>) => productApi.update(householdId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', householdId] });
    },
  });
}

export function useDeleteProduct() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => productApi.delete(householdId!, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', householdId] });
    },
  });
}

export function useRestockProduct() {
  const householdId = useAuthStore((s) => s.activeHouseholdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...data }: { productId: number; quantity: number; price?: number; store?: string }) =>
      productApi.restock(householdId!, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', householdId] });
    },
  });
}
