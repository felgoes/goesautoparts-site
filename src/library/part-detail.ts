import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import type { CatalogProduct } from '../core/models';
import type { LibraryPart } from './library.models';
import { TelemetryService } from '../shared/telemetry';
import { resolveExactSku } from './catalog-offer';

type OfferState = 'loading' | 'resolved' | 'missing' | 'duplicate' | 'error';

@Component({
  selector: 'app-part-detail',
  imports: [CurrencyPipe],
  templateUrl: './part-detail.html',
  styleUrl: './part-detail.scss',
})
export class PartDetail implements OnInit {
  readonly part = input.required<LibraryPart>();
  readonly vehicleId = input.required<string>();
  readonly partRoute = input.required<string>();
  readonly entrySource = input<'menu' | 'direct' | 'internal'>('direct');
  private readonly http = inject(HttpClient);
  private readonly telemetry = inject(TelemetryService);
  readonly offerState = signal<OfferState>('loading');
  readonly offer = signal<CatalogProduct | null>(null);
  readonly copyMessage = signal('');
  readonly photos = () => this.part().photos;
  async ngOnInit() {
    const sku = this.part().catalogSku;
    if (!sku) {
      this.offerState.set('missing');
      return;
    }
    try {
      const params = new HttpParams().set('search', sku).set('limit', '100');
      const results = await firstValueFrom(
        this.http.get<CatalogProduct[]>('/api/v1/catalog/products', { params }).pipe(timeout(8000)),
      );
      const match = resolveExactSku(results, sku);
      if (match.status === 'resolved') {
        this.offer.set(match.product);
        this.offerState.set('resolved');
      } else this.offerState.set(match.status);
    } catch {
      this.offerState.set('error');
    }
  }
  photoSrcSet(photo: LibraryPart['photos'][number]) {
    return photo.variants.map((variant) => variant.src + ' ' + variant.width + 'w').join(', ');
  }
  catalogUrl() {
    return '/?sku=' + encodeURIComponent(this.part().catalogSku ?? '') + '#catalogo';
  }
  quoteUrl() {
    const params = new URLSearchParams({
      vehicle_id: this.vehicleId(),
      part_id: this.part().id,
      source: this.entrySource(),
    });
    return '/?' + params.toString() + '#cotacao';
  }
  async copyCode() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard indisponível');
      await navigator.clipboard.writeText(this.part().reference.code);
      this.copyMessage.set('Código copiado');
      this.telemetry.track('library_reference_copy', {
        vehicle_id: this.vehicleId(),
        part_id: this.part().id,
        sku: this.part().catalogSku ?? '',
        entry_source: this.entrySource(),
      });
    } catch {
      this.copyMessage.set('Selecione e copie o código acima');
    }
  }
}
