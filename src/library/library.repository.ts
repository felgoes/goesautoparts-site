import { Injectable } from '@angular/core';
import { libraryCards, loadLibraryEntry } from './generated/library.generated';
import type { LibraryEntry, QuoteContext } from './library.models';

@Injectable({ providedIn: 'root' })
export class LibraryRepository {
  cards() {
    return libraryCards;
  }
  async entryForRoute(route: string): Promise<LibraryEntry | null> {
    const card = libraryCards.find(
      (item) => item.route.replace(/\/$/, '') === route.replace(/\/$/, ''),
    );
    return card ? loadLibraryEntry(card.vehicleId) : null;
  }
  async quoteContext(vehicleId: string, partId: string): Promise<QuoteContext | null> {
    const entry = await loadLibraryEntry(vehicleId);
    if (!entry || entry.publicationStatus !== 'published') return null;
    const part = entry.parts.find(
      (item) => item.id === partId && item.fitment.review.status === 'approved',
    );
    if (!part) return null;
    return {
      vehicleId,
      partId,
      vehicle: entry.vehicle.make + ' ' + entry.vehicle.model,
      version:
        entry.vehicle.modelYear +
        ' · ' +
        entry.vehicle.trim +
        ' · ' +
        entry.vehicle.engine +
        ' · ' +
        entry.vehicle.transmission,
      part: part.name + ' · ' + part.reference.code,
      origin: 'library',
    };
  }
}
