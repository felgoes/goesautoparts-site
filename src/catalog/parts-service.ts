import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import type { QuoteContext } from '../library/library.models';

interface RankingItem {
  model: string;
  registrations: number;
}
interface Ranking {
  period: string | null;
  source: string;
  source_url: string;
  items: RankingItem[];
}
const segments = [
  { value: 'automovel', label: 'Automóveis' },
  { value: 'comercial_leve', label: 'Comerciais leves' },
] as const;

@Component({
  selector: 'app-parts-service',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './parts-service.html',
  styleUrl: './parts-service.scss',
})
export class PartsService implements OnInit, OnChanges {
  private readonly http = inject(HttpClient);
  private request?: Subscription;
  readonly whatsapp = input.required<string>();
  readonly quoteOpened = output<'library_quote' | 'parts_quote'>();
  readonly quoteContext = input<QuoteContext | null>(null);
  readonly quoteContextError = input(false);
  readonly segments = segments;
  readonly segment = signal<(typeof segments)[number]['value']>('automovel');
  readonly ranking = signal<Ranking | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly expanded = signal(false);
  readonly toggle = (value: boolean) => !value;
  readonly visible = computed(() => this.ranking()?.items.slice(0, this.expanded() ? 20 : 5) ?? []);
  readonly periodLabel = computed(() => {
    const period = this.ranking()?.period;
    if (!period) return '';
    const [year, month] = period.split('-');
    return month + '/' + year;
  });
  vehicle = '';
  version = '';
  part = '';

  ngOnInit() {
    this.loadRanking();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (!changes['quoteContext']) return;
    const context = this.quoteContext();
    if (!context) return;
    this.vehicle = context.vehicle.slice(0, 100);
    this.version = context.version.slice(0, 100);
    this.part = context.part.slice(0, 180);
  }
  loadRanking(category = this.segment()) {
    this.request?.unsubscribe();
    this.segment.set(category);
    this.expanded.set(false);
    this.loading.set(true);
    this.failed.set(false);
    this.ranking.set(null);
    this.request = this.http
      .get<Ranking>('/api/v1/catalog/vehicle-ranking', { params: { category } })
      .subscribe({
        next: (data) => {
          this.ranking.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
  get canQuote() {
    return Boolean(this.vehicle.trim() && this.part.trim());
  }
  quote() {
    const vehicle = this.vehicle.trim();
    const part = this.part.trim();
    if (!vehicle || !part) return;
    const text = [
      'Olá! Gostaria de identificar e cotar uma peça pela Goes Auto Parts.',
      'Veículo: ' + vehicle,
      this.version.trim() && 'Ano/motor/versão: ' + this.version.trim(),
      'Peça ou referência: ' + part,
      'Podem confirmar a aplicação, o preço e o prazo?',
    ]
      .filter(Boolean)
      .join('\n');
    const url = new URL(this.whatsapp());
    url.searchParams.set('text', text);
    window.open(url.href, '_blank', 'noopener,noreferrer');
    this.quoteOpened.emit(
      this.quoteContext()?.origin === 'library' ? 'library_quote' : 'parts_quote',
    );
  }
}
