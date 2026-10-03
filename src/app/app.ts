import { Component } from '@angular/core';

import { CatalogPage } from '../catalog/catalog';

@Component({
  selector: 'app-root',
  imports: [CatalogPage],
  template: '<app-catalog />',
})
export class App {}
