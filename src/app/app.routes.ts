import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../catalog/catalog').then((module) => module.CatalogPage),
    pathMatch: 'full',
  },
  {
    path: 'consulta-por-carro',
    loadComponent: () =>
      import('../library/library-gallery').then((module) => module.LibraryGallery),
  },
  {
    path: 'consulta-por-carro/:make/:model',
    loadComponent: () => import('../library/vehicle-page').then((module) => module.VehiclePage),
  },
  {
    path: '**',
    loadComponent: () => import('../library/not-found').then((module) => module.NotFoundPage),
  },
];
