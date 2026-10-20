export interface CatalogListing {
  provider: string;
  external_item_id: string;
  title: string | null;
  permalink: string | null;
  thumbnail: string | null;
  images: string[];
  marketplace_price: number | null;
  available_quantity: number | null;
  sold_quantity: number | null;
  visits: number | null;
  status: string | null;
  attributes: { name: string; value: string }[];
  synchronized_at: string | null;
}

export interface CatalogFitment {
  make: string;
  model: string;
  year_from?: number | null;
  year_to?: number | null;
  engine?: string | null;
  version?: string | null;
  catalog_product_id?: string | null;
  source?: string | null;
  external_item_id?: string | null;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  manufacturer_part_number?: string | null;
  images?: { url: string }[];
  fitments?: CatalogFitment[];
  sale_price: number;
  in_stock: boolean;
  listings: CatalogListing[];
}
