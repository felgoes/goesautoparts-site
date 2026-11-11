import { AfterViewInit, Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotFoundPage } from './not-found';
import { Meta, Title } from '@angular/platform-browser';
import { LibraryRepository } from './library.repository';
import { PartDetail } from './part-detail';
import type { LibraryEntry } from './library.models';
import { TelemetryService } from '../shared/telemetry';

@Component({
  selector: 'app-library-vehicle',
  imports: [RouterLink, PartDetail, NotFoundPage],
  templateUrl: './vehicle-page.html',
  styleUrl: './vehicle-page.scss',
})
export class VehiclePage implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(LibraryRepository);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly telemetry = inject(TelemetryService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly entry = signal<LibraryEntry | null>(null);
  readonly expandedPart = signal<string | null>(null);
  readonly entrySource = signal<'menu' | 'direct' | 'internal'>('direct');
  private readonly trackedParts = new Set<string>();

  async ngOnInit() {
    const make = this.route.snapshot.paramMap.get('make') ?? '';
    const model = this.route.snapshot.paramMap.get('model') ?? '';
    const source = this.route.snapshot.queryParamMap.get('source');
    this.entrySource.set(source === 'menu' || source === 'internal' ? source : 'direct');
    const entry = await this.repository.entryForRoute('/consulta-por-carro/' + make + '/' + model);
    this.entry.set(entry);
    if (!entry) {
      this.title.setTitle('Ficha não disponível | Biblioteca Goes Auto Parts');
      this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
      return;
    }
    this.title.setTitle(
      entry.vehicle.make +
        ' ' +
        entry.vehicle.model +
        ' ' +
        entry.vehicle.trim +
        ' ' +
        entry.vehicle.modelYear +
        ' | Biblioteca Goes Auto Parts',
    );
    this.meta.updateTag({
      name: 'description',
      content:
        'Fotos, ficha técnica e peças para ' +
        entry.vehicle.make +
        ' ' +
        entry.vehicle.model +
        ' ' +
        entry.vehicle.trim +
        ' ' +
        entry.vehicle.modelYear +
        '.',
    });
    this.meta.updateTag({ property: 'og:title', content: this.title.getTitle() });
    this.meta.updateTag({ name: 'robots', content: 'index,follow' });
    this.telemetry.track('library_vehicle_view', {
      vehicle_id: entry.vehicle.id,
      entry_source: this.entrySource(),
    });
    this.route.fragment.subscribe((fragment) => {
      if (fragment && entry.parts.some((part) => part.id === fragment))
        this.openPart(fragment, false);
    });
  }
  ngAfterViewInit() {
    if (this.browser) this.focusFragment();
  }
  async openPart(partId: string, updateUrl = true) {
    if (!this.entry()?.parts.some((part) => part.id === partId)) return;
    this.expandedPart.set(partId);
    if (!this.trackedParts.has(partId)) {
      this.trackedParts.add(partId);
      this.telemetry.track('library_part_view', {
        vehicle_id: this.entry()!.vehicle.id,
        part_id: partId,
        entry_source: updateUrl ? 'internal' : 'direct',
      });
    }
    if (updateUrl) await this.router.navigate([], { relativeTo: this.route, fragment: partId });
    this.focusFragment();
  }
  private focusFragment() {
    if (!this.browser || !this.expandedPart()) return;
    setTimeout(() => {
      const heading = document.getElementById(this.expandedPart()!);
      heading?.scrollIntoView({ block: 'start' });
      heading?.focus();
    });
  }
}
