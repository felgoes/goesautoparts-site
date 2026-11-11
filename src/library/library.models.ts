export type ReviewStatus = 'pending' | 'approved';
export interface Review {
  status: ReviewStatus;
  reviewer: string | null;
  reviewedAt: string | null;
  sourceIds: string[];
}
export interface Source {
  id: string;
  title: string;
  url: string | null;
  evidenceId: string | null;
  scope: 'vehicle' | 'fitment' | 'photo';
  status: ReviewStatus;
  consultedAt: string | null;
}
export interface LibraryPhoto {
  id: string;
  role: 'cover' | 'part' | 'identification';
  alt: string;
  variants: { src: string; width: number; height: number }[];
  author: string | null;
  originUrl: string | null;
  license: string | null;
  licenseUrl: string | null;
  credit: string | null;
  rightsEvidenceId: string | null;
  review: Review;
}
export interface LibraryVehicle {
  id: string;
  market: 'BR';
  make: string;
  model: string;
  trim: string;
  modelYear: number;
  engine: string;
  transmission: string;
  externalIds: { wikidata: string | null; fipeCode: string | null };
  review: Review;
}
export interface LibraryPart {
  id: string;
  name: string;
  reference: {
    code: string;
    kind: 'oem' | 'manufacturer' | 'unclassified';
    manufacturer: string | null;
    review: Review;
  };
  catalogSku: string | null;
  comparison: string;
  photos: LibraryPhoto[];
  fitment: { vehicleId: string; review: Review };
}
export interface LibraryEntry {
  schemaVersion: 1;
  publicationStatus: 'draft' | 'published';
  route: string;
  vehicle: LibraryVehicle;
  cover: LibraryPhoto;
  parts: LibraryPart[];
  sources: Source[];
}
export interface LibraryCard {
  vehicleId: string;
  route: string;
  make: string;
  model: string;
  trim: string;
  modelYear: number;
  thumbnail: { src: string; width: number; height: number; alt: string };
}
export interface QuoteContext {
  vehicleId: string;
  partId: string;
  vehicle: string;
  version: string;
  part: string;
  origin: 'library';
}
