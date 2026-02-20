import apiClient from './client';

export interface OpenFoodFactsProduct {
  name: string | null;
  brand: string | null;
  categories: string[];
  image_url: string | null;
  quantity_text: string | null;
}

export interface BarcodeLookupResult {
  found: boolean;
  message?: string;
  product?: OpenFoodFactsProduct;
}

export const barcodeApi = {
  lookup: (barcode: string) =>
    apiClient
      .get<BarcodeLookupResult>('/barcode/lookup', { params: { barcode } })
      .then((r) => r.data),
};
