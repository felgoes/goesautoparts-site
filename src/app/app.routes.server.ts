import { RenderMode, ServerRoute } from '@angular/ssr';
import { libraryCards } from '../library/generated/library.generated';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },
  { path: 'consulta-por-carro', renderMode: RenderMode.Prerender },
  {
    path: 'consulta-por-carro/:make/:model',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      libraryCards.map((card) => {
        const [, , make, model] = card.route.split('/');
        return { make, model };
      }),
  },
  { path: '**', renderMode: RenderMode.Client },
];
