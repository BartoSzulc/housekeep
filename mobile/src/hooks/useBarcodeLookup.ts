import { useQuery } from '@tanstack/react-query';
import { barcodeApi } from '../api/barcode';

export function useBarcodeLookup(barcode: string | null) {
  return useQuery({
    queryKey: ['barcode', barcode],
    queryFn: () => barcodeApi.lookup(barcode!),
    enabled: !!barcode && barcode.length >= 8,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    retry: 1,
  });
}
