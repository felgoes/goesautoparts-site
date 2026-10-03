export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  sale_price: number;
  in_stock: boolean;
}
