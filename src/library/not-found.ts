import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-library-not-found',
  imports: [RouterLink],
  template: `<main class="not-found">
    <p class="eyebrow">Biblioteca Goes Auto Parts</p>
    <h1>Ficha não disponível</h1>
    <p>Esta ficha ainda não foi publicada ou não existe.</p>
    <a routerLink="/consulta-por-carro">Voltar à Biblioteca</a>
  </main>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #090a0d;
        color: #f5f6f7;
        font-family: 'Source Sans 3', Arial, sans-serif;
      }
      .not-found {
        width: min(800px, calc(100% - 32px));
        margin: 0 auto;
        padding: 80px 0;
      }
      .eyebrow {
        color: #bbc2ca;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 12px;
      }
      h1 {
        font-size: clamp(32px, 5vw, 48px);
      }
      a {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        padding: 8px 16px;
        background: #087a60;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      }
      :focus-visible {
        outline: 3px solid #50c3a5;
        outline-offset: 4px;
      }
    `,
  ],
})
export class NotFoundPage {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  constructor() {
    this.title.setTitle('Ficha não disponível | Biblioteca Goes Auto Parts');
    this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
  }
}
