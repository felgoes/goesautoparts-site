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

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  sale_price: number;
  in_stock: boolean;
  listings: CatalogListing[];
}


