import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PartsService } from './parts-service';

describe('Cotação de peças', () => {
  it('prepara a mensagem de um modelo selecionado sem enviar automaticamente', () => {
    TestBed.configureTestingModule({
      imports: [PartsService],
      providers: [provideHttpClient()],
    });
    const fixture = TestBed.createComponent(PartsService);
    const service = fixture.componentInstance;
    fixture.componentRef.setInput('whatsapp', 'https://wa.me/5500000000000?text=Mensagem+antiga');
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    try {
      service.quoteVehicle('Tiggo 7');
      service.quote();
      expect(open).not.toHaveBeenCalled();

      service.version = '2024, 1.5 turbo';
      service.part = 'Sensor & chicote';
      service.selectSystem(service.systems[0]);
      service.quote();
      expect(open).toHaveBeenCalledTimes(1);
      const url = new URL(open.mock.calls[0][0]!);
      expect(url.origin).toBe('https://wa.me');
      expect(url.pathname).toBe('/5500000000000');
      expect(url.searchParams.get('text')).toBe(
        'Olá! Gostaria de identificar e cotar uma peça pela Goes Auto Parts.\n' +
          'Veículo: Tiggo 7\nAno/motor/versão: 2024, 1.5 turbo\n' +
          'Sistema: Motor\nPeça ou referência: Sensor & chicote\n' +
          'Podem confirmar a aplicação, o preço e o prazo?',
      );
    } finally {
      open.mockRestore();
    }
  });
});
