import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogFitment, CatalogProduct } from '../core/models';

interface FitmentCard {
  key: string;
  make: string;
  model: string;
  yearLabel: string;
  engines: string[];
  versions: string[];
  count: number;
}

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe, FormsModule],
  template: `
    <main class="catalog-shell">
      <header class="catalog-header">
        <a class="brand" href="/" aria-label="Goes Auto Parts">
          <img src="/brand/goes-wordmark.png" alt="Goes Auto Parts" />
        </a>
        <nav>
          <a href="#catalogo">Catálogo técnico</a>
          <a href="#como-comprar">Como comprar</a>
        </nav>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="kicker">REPOSIÇÃO PARA OFICINAS E PROFISSIONAIS DA REPARAÇÃO</p>
          <h1>A peça certa para a sua oficina.</h1>
          <p class="hero-text">
            Peças para veículos chineses organizadas por SKU, código OEM e aplicação. Consulte
            fotos, referências e disponibilidade do anúncio antes de fechar o pedido.
          </p>
          <p class="audience-note">Oficinas · mecânicos · auto centers · lojas de autopeças</p>
          <div class="hero-actions">
            <a class="button button-red" href="#catalogo">Buscar peça para oficina</a>
          </div>
        </div>
      </section>

      <section class="catalog-section" id="catalogo">
        <div class="section-head">
          <div>
            <p class="kicker">CATÁLOGO TÉCNICO</p>
            <h2>Encontre a peça pelo código ou pela aplicação.</h2>
          </div>
          <p class="section-note">
            Comece pelo SKU, código OEM ou dados do veículo. Confirme versão, motor e ano antes do
            pedido.
          </p>
        </div>
        <div class="search-row">
          <label class="search-box">
            <span>Peça, código ou veículo</span>
            <input
              [ngModel]="search"
              (ngModelChange)="onSearch($event)"
              (keyup.enter)="load()"
              placeholder="Ex.: LR174890, 0280157176 ou Tiggo 7 1.5"
            />
          </label>
          <button class="button button-dark" (click)="load()">Buscar no catálogo</button>
        </div>
        @if (loading()) {
          <div class="catalog-state">Atualizando o catálogo...</div>
        } @else if (error()) {
          <div class="catalog-state error">
            <strong>Não conseguimos carregar o catálogo.</strong
            ><span>Tente novamente em instantes.</span>
          </div>
        } @else if (!products().length) {
          <div class="catalog-state">
            <strong>Nenhuma peça encontrada.</strong
            ><span>Revise o SKU, código OEM, modelo, ano e motorização do veículo.</span>
          </div>
        } @else {
          <div class="product-grid">
            @for (product of products(); track product.id) {
              <article
                class="product-card"
                tabindex="0"
                (click)="openProduct(product)"
                (keydown.enter)="openProduct(product)"
              >
                <div class="product-code">SKU {{ product.sku }}</div>
                @if (product.images?.[0]?.url || product.listings[0]?.thumbnail) {
                  <img
                    class="product-image"
                    [src]="product.images?.[0]?.url || product.listings[0].thumbnail"
                    [alt]="product.name"
                    loading="lazy"
                  />
                } @else {
                  <div class="product-glyph">Foto indisponível</div>
                }
                <div class="product-body">
                  <h3>{{ product.name }}</h3>
                  @if (product.manufacturer_part_number) {
                    <p class="product-meta">Código OEM: {{ product.manufacturer_part_number }}</p>
                  }
                  @if (product.fitments?.[0]; as fitment) {
                    <p class="product-meta">Aplicação: {{ fitment.make }} {{ fitment.model }}</p>
                  }
                  @if (product.description) {
                    <p>{{ product.description }}</p>
                  }
                  <div class="product-foot">
                    <strong>{{ product.sale_price | currency: 'BRL' }}</strong>
                    <span [class.out]="!product.in_stock">
                      {{ product.in_stock ? 'Disponível' : 'Consulte disponibilidade' }}
                    </span>
                  </div>
                  @if (product.listings[0]?.permalink) {
                    <a
                      class="product-link product-marketplace-link"
                      [href]="product.listings[0].permalink"
                      target="_blank"
                      rel="noopener"
                      (click)="
                        $event.stopPropagation();
                        track('mercado_livre_click', {
                          sku: product.sku,
                          placement: 'product_card',
                        })
                      "
                      >Ver oferta no Mercado Livre ↗</a
                    >
                  }
                </div>
              </article>
            }
          </div>
        }
      </section>

      @if (selected(); as product) {
        <div class="catalog-modal-backdrop" (click)="closeProduct()">
          <section
            class="catalog-modal"
            [class.no-gallery]="!product.images?.length"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes da peça"
            (click)="$event.stopPropagation()"
          >
            <button
              class="catalog-modal-close"
              type="button"
              aria-label="Fechar detalhes"
              (click)="closeProduct()"
            >
              ×
            </button>
            <div class="catalog-modal-layout">
              @if (product.images?.length) {
                <section class="catalog-modal-gallery" aria-label="Fotos da peça">
                  <div class="gallery-topline">
                    <span>Fotos da peça</span>
                    @if ((product.images?.length ?? 0) > 1) {
                      <span class="gallery-count"
                        >{{ photoIndex() + 1 }} / {{ product.images?.length }}</span
                      >
                    }
                  </div>
                  <div class="gallery-stage">
                    <div
                      #galleryViewport
                      class="gallery-viewport"
                      (scroll)="onPhotoScroll(galleryViewport)"
                    >
                      @for (image of product.images; track image.url) {
                        <figure class="gallery-slide">
                          <img [src]="image.url" [alt]="product.name" loading="eager" />
                        </figure>
                      }
                    </div>
                    @if ((product.images?.length ?? 0) > 1) {
                      <button
                        type="button"
                        class="gallery-arrow previous"
                        aria-label="Foto anterior"
                        (click)="movePhoto(galleryViewport, -1)"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        class="gallery-arrow next"
                        aria-label="Próxima foto"
                        (click)="movePhoto(galleryViewport, 1)"
                      >
                        ›
                      </button>
                    }
                  </div>
                  @if ((product.images?.length ?? 0) > 1) {
                    <div class="gallery-thumbs" aria-label="Selecionar foto">
                      @for (image of product.images; track image.url; let index = $index) {
                        <button
                          type="button"
                          [class.active]="photoIndex() === index"
                          [attr.aria-label]="'Abrir foto ' + (index + 1)"
                          (click)="goToPhoto(galleryViewport, index)"
                        >
                          <img [src]="image.url" [alt]="product.name" loading="lazy" />
                        </button>
                      }
                    </div>
                  }
                </section>
              }

              <div class="catalog-modal-content">
                <div class="catalog-modal-head">
                  <div>
                    <p class="kicker">FICHA TÉCNICA</p>
                    <h2>{{ product.name }}</h2>
                    <p class="modal-sku">SKU {{ product.sku }}</p>
                  </div>
                  <span [class.out]="!product.in_stock" class="modal-stock">{{
                    product.in_stock ? 'Disponível' : 'Consulte disponibilidade'
                  }}</span>
                </div>
                <p class="modal-description">
                  {{
                    product.description ||
                      'Confira fotos, código OEM, aplicação e disponibilidade antes de fechar o pedido.'
                  }}
                </p>
                @if (fitmentCards().length) {
                  <section class="fitment-deck" aria-label="Aplicações compatíveis">
                    <div class="fitment-deck-head">
                      <div>
                        <p class="kicker">APLICAÇÕES</p>
                        <h3>Compatibilidade veicular</h3>
                      </div>
                      <span>{{ product.fitments?.length }} versões</span>
                    </div>
                    <div class="fitment-rail">
                      @for (card of fitmentCards(); track card.key) {
                        <article class="fitment-card">
                          <div class="fitment-card-top">
                            <span>{{ card.make }}</span>
                            <small>APLICAÇÃO</small>
                          </div>
                          <strong>{{ card.model }}</strong>
                          <b class="fitment-years">{{ card.yearLabel }}</b>
                          <dl>
                            <div>
                              <dt>Motor</dt>
                              <dd>{{ card.engines.join(' · ') || 'Consulte' }}</dd>
                            </div>
                            <div>
                              <dt>Versão</dt>
                              <dd>{{ card.versions[0] || 'Compatível' }}</dd>
                            </div>
                          </dl>
                          <footer>
                            <span>{{ card.count }} aplicações</span>
                            <b>✓ Compatível</b>
                          </footer>
                        </article>
                      }
                    </div>
                  </section>
                }
                @if (product.manufacturer_part_number || product.fitments?.length) {
                  <div class="catalog-facts">
                    @if (product.manufacturer_part_number) {
                      <span>
                        <small>Código OEM</small>
                        <strong>{{ product.manufacturer_part_number }}</strong>
                      </span>
                    }
                    @if (product.fitments?.[0]; as fitment) {
                      <span>
                        <small>Aplicação</small>
                        <strong>{{ fitment.make }} {{ fitment.model }}</strong>
                      </span>
                    }
                  </div>
                }
                @for (listing of product.listings; track listing.external_item_id) {
                  <article class="catalog-listing">
                    <div class="listing-top">
                      <small>Oferta no Mercado Livre · {{ listing.external_item_id }}</small>
                      <strong>{{
                        listing.marketplace_price ?? product.sale_price | currency: 'BRL'
                      }}</strong>
                    </div>
                    <p class="offer-stock">
                      Estoque no anúncio
                      <b>{{ listing.available_quantity ?? '—' }}</b>
                    </p>
                    @if (listing.attributes.length) {
                      <details class="listing-specs">
                        <summary>
                          Especificações do anúncio
                          <span>{{ listing.attributes.length }}</span>
                        </summary>
                        <div class="attribute-list">
                          @for (attribute of listing.attributes; track attribute.name) {
                            <span
                              ><small>{{ attribute.name }}</small
                              ><b>{{ attribute.value }}</b></span
                            >
                          }
                        </div>
                      </details>
                    }
                    <div class="listing-actions">
                      @if (listing.permalink) {
                        <a
                          class="button button-quiet listing-external"
                          [href]="listing.permalink"
                          target="_blank"
                          rel="noopener"
                          (click)="
                            track('mercado_livre_click', {
                              sku: product.sku,
                              placement: 'product_detail',
                            })
                          "
                          >Ver oferta no Mercado Livre ↗</a
                        >
                      }
                    </div>
                  </article>
                } @empty {
                  <div class="listing-empty">
                    Este produto ainda não possui um anúncio vinculado.
                  </div>
                }
              </div>
            </div>
          </section>
        </div>
      }

      <section class="how-section" id="como-comprar">
        <div>
          <p class="kicker">FLUXO DE COMPRA</p>
          <h2>Informação técnica antes do pedido.</h2>
        </div>
        <div class="steps">
          <div><b>01</b><span>Localize a peça por SKU, código OEM ou aplicação.</span></div>
          <div><b>02</b><span>Compare fotos, referências e especificações do anúncio.</span></div>
          <div><b>03</b><span>Confirme versão, motor e ano antes de concluir.</span></div>
        </div>
      </section>

      <footer class="catalog-footer">
        <div class="brand footer-brand">
          <img src="/brand/goes-wordmark.png" alt="Goes Auto Parts" />
        </div>
        <p>Reposição para veículos chineses, com foco em oficinas e profissionais da reparação.</p>
      </footer>
    </main>
  `,
  styleUrl: './catalog.scss',
})
export class CatalogPage implements OnInit {
  private readonly http = inject(HttpClient);
  readonly products = signal<CatalogProduct[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly selected = signal<CatalogProduct | null>(null);
  readonly photoIndex = signal(0);
  readonly fitmentCards = computed(() => this.groupFitments(this.selected()?.fitments ?? []));
  search = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  private lastTrackedSearch = '';
  private previousFocus: HTMLElement | null = null;

  ngOnInit() {
    this.track('landing_view');
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(false);
    let params = new HttpParams();
    const query = this.search.trim();
    if (query) {
      params = params.set('search', query);
      if (query !== this.lastTrackedSearch) {
        this.lastTrackedSearch = query;
        this.track('catalog_search', { source: 'site' });
      }
    }
    this.http.get<CatalogProduct[]>('/api/v1/catalog/products', { params }).subscribe({
      next: (products) => {
        this.products.set(products);
        if (!products.length && query) this.track('catalog_empty_result', { source: 'site' });
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string) {
    this.search = value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 280);
  }

  glyph(name: string) {
    return name.trim().slice(0, 2).toUpperCase();
  }

  openProduct(product: CatalogProduct) {
    this.previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.photoIndex.set(0);
    this.selected.set(product);
    this.track('product_view', { sku: product.sku });
    setTimeout(() => document.querySelector<HTMLButtonElement>('.catalog-modal-close')?.focus());
  }

  closeProduct() {
    if (!this.selected()) return;
    this.selected.set(null);
    this.previousFocus?.focus();
    this.previousFocus = null;
  }

  movePhoto(viewport: HTMLElement, direction: -1 | 1) {
    viewport.scrollBy({ left: viewport.clientWidth * direction, behavior: 'smooth' });
  }

  goToPhoto(viewport: HTMLElement, index: number) {
    viewport.scrollTo({ left: viewport.clientWidth * index, behavior: 'smooth' });
  }

  onPhotoScroll(viewport: HTMLElement) {
    if (!viewport.clientWidth) return;
    this.photoIndex.set(Math.round(viewport.scrollLeft / viewport.clientWidth));
  }

  private groupFitments(fitments: CatalogFitment[]): FitmentCard[] {
    const cards = new Map<
      string,
      {
        make: string;
        model: string;
        years: number[];
        engines: Set<string>;
        versions: Set<string>;
        count: number;
      }
    >();
    for (const fitment of fitments) {
      const make = fitment.make.trim();
      const model = fitment.model.trim();
      if (!make || !model) continue;
      const key = `${make.toLocaleLowerCase('pt-BR')}|${model.toLocaleLowerCase('pt-BR')}`;
      const card = cards.get(key) ?? {
        make,
        model,
        years: [],
        engines: new Set<string>(),
        versions: new Set<string>(),
        count: 0,
      };
      if (fitment.year_from) card.years.push(fitment.year_from);
      if (fitment.year_to) card.years.push(fitment.year_to);
      if (fitment.engine) card.engines.add(fitment.engine);
      if (fitment.version) card.versions.add(fitment.version);
      card.count += 1;
      cards.set(key, card);
    }
    return [...cards.entries()]
      .map(([key, card]) => ({
        key,
        make: card.make,
        model: card.model,
        yearLabel: this.yearRange(card.years),
        engines: [...card.engines].sort(),
        versions: [...card.versions].sort(),
        count: card.count,
      }))
      .sort((left, right) =>
        `${left.make} ${left.model}`.localeCompare(`${right.make} ${right.model}`, 'pt-BR'),
      );
  }

  private yearRange(years: number[]): string {
    if (!years.length) return 'Consulte o ano';
    const first = Math.min(...years);
    const last = Math.max(...years);
    return first === last ? String(first) : `${first}–${last}`;
  }

  @HostListener('document:keydown.arrowleft')
  onPreviousPhoto() {
    const viewport = document.querySelector<HTMLElement>('.gallery-viewport');
    if (viewport) this.movePhoto(viewport, -1);
  }

  @HostListener('document:keydown.arrowright')
  onNextPhoto() {
    const viewport = document.querySelector<HTMLElement>('.gallery-viewport');
    if (viewport) this.movePhoto(viewport, 1);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeProduct();
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(event: Event) {
    if (!this.selected()) return;
    if (!(event instanceof KeyboardEvent)) return;
    const controls = Array.from(
      document.querySelectorAll<HTMLElement>('.catalog-modal button, .catalog-modal a[href]'),
    );
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  track(name: string, properties: Record<string, string> = {}) {
    const key = 'goes-autoparts-anonymous-id';
    const anonymousId = localStorage.getItem(key) ?? crypto.randomUUID();
    localStorage.setItem(key, anonymousId);
    void fetch('/api/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, source: 'site', anonymous_id: anonymousId, properties }),
      keepalive: true,
    }).catch(() => undefined);
  }
}
