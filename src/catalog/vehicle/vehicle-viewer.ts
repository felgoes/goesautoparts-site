import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { VehicleScene } from './vehicle-scene';

export const vehicleSystems = [
  { id: 'motor', name: 'Motor', example: 'Ex.: bico injetor ou código OEM' },
  { id: 'freios', name: 'Freios', example: 'Ex.: pastilha dianteira ou código OEM' },
  { id: 'suspensao', name: 'Suspensão', example: 'Ex.: bandeja esquerda ou código OEM' },
] as const;

export type VehicleSystem = (typeof vehicleSystems)[number];

@Component({
  selector: 'app-vehicle-viewer',
  templateUrl: './vehicle-viewer.html',
  styleUrl: './vehicle-viewer.scss',
})
export class VehicleViewer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly lifetime = new AbortController();
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private scene?: VehicleScene;
  readonly status = signal<'waiting' | 'loading' | 'ready' | 'unavailable'>('waiting');
  readonly selected = input<VehicleSystem | null>(null);
  readonly picked = output<VehicleSystem>();
  readonly systems = vehicleSystems;

  constructor() {
    const destroy = inject(DestroyRef);
    let observer: IntersectionObserver | undefined;
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            observer?.disconnect();
            void this.load();
          },
          { rootMargin: '160px' },
        );
        observer.observe(this.host.nativeElement);
      });
    });
    destroy.onDestroy(() => {
      observer?.disconnect();
      this.lifetime.abort();
      this.scene?.dispose();
    });
  }

  rotate(direction: number) {
    this.scene?.rotate((direction * Math.PI) / 6);
  }

  reset() {
    this.scene?.reset();
  }

  private async load() {
    this.status.set('loading');
    const { signal } = this.lifetime;
    try {
      const { createVehicleScene } = await import('./vehicle-scene');
      this.scene = await createVehicleScene(
        this.stage().nativeElement,
        this.canvas().nativeElement,
        signal,
        () => this.status.set('unavailable'),
      );
      if (!signal.aborted) this.status.set('ready');
    } catch {
      if (!signal.aborted) this.status.set('unavailable');
    }
  }
}
