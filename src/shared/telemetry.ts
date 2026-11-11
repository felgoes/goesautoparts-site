import { Injectable } from '@angular/core';

export type TelemetryEvent =
  | 'landing_view'
  | 'catalog_search'
  | 'product_view'
  | 'mercado_livre_click'
  | 'whatsapp_click'
  | 'catalog_empty_result'
  | 'library_vehicle_view'
  | 'library_part_view'
  | 'library_reference_copy';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  track(name: TelemetryEvent, properties: Record<string, string> = {}) {
    try {
      const key = 'goes-autoparts-anonymous-id';
      let anonymousId = localStorage.getItem(key);
      if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem(key, anonymousId);
      }
      void fetch('/api/v1/telemetry/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, source: 'site', anonymous_id: anonymousId, properties }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      /* Le stockage e a telemetria nao bloqueiam a consulta. */
    }
  }
}
