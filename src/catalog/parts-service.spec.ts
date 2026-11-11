import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import localePt from '@angular/common/locales/pt';
import { PartsService } from './parts-service';

registerLocaleData(localePt);

describe('Cotação de peças', () => {
  it('prepara a mensagem com veículo e peça sem enviar automaticamente', () => {
    TestBed.configureTestingModule({ imports: [PartsService], providers: [provideHttpClient()] });
    const fixture = TestBed.createComponent(PartsService);
    const service = fixture.componentInstance;
    fixture.componentRef.setInput('whatsapp', 'https://wa.me/5500000000000?text=Mensagem+antiga');
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    try {
      service.vehicle = 'Tiggo 7';
      service.quote();
      expect(open).not.toHaveBeenCalled();
      service.version = '2024, 1.5 turbo';
      service.part = 'Sensor & chicote';
      service.quote();
      expect(open).toHaveBeenCalledTimes(1);
      const [url, target, features] = open.mock.calls[0]!;
      const parsed = new URL(url!);
      expect(parsed.origin).toBe('https://wa.me');
      expect(parsed.pathname).toBe('/5500000000000');
      expect(parsed.searchParams.get('text')).toBe(
        'Olá! Gostaria de identificar e cotar uma peça pela Goes Auto Parts.\n' +
          'Veículo: Tiggo 7\nAno/motor/versão: 2024, 1.5 turbo\n' +
          'Peça ou referência: Sensor & chicote\nPodem confirmar a aplicação, o preço e o prazo?',
      );
      expect(target).toBe('_blank');
      expect(features).toBe('noopener,noreferrer');
    } finally {
      open.mockRestore();
    }
  });

  it('mantém o ranking informativo, sem ação comercial nas linhas', () => {
    TestBed.configureTestingModule({
      imports: [PartsService],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(PartsService);
    fixture.componentRef.setInput('whatsapp', 'https://wa.me/5500000000000');
    fixture.detectChanges();
    const request = http.expectOne((req) => req.url === '/api/v1/catalog/vehicle-ranking');
    expect(request.request.params.get('category')).toBe('automovel');
    request.flush({
      period: '2026-10',
      source: 'Fonte QA',
      source_url: 'https://example.test',
      items: [{ model: 'Modelo QA', registrations: 123 }],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ranking-list a')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Emplacamentos de veículos novos por segmento, com competência e fonte.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Cotar peça');
    http.verify();
  });
});
