import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LibraryRepository } from './library.repository';

@Component({
  selector: 'app-library-gallery',
  imports: [RouterLink],
  templateUrl: './library-gallery.html',
  styleUrl: './library-gallery.scss',
})
export class LibraryGallery {
  readonly cards = inject(LibraryRepository).cards();
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  constructor() {
    this.title.setTitle('Ache a sua peça | Biblioteca Goes Auto Parts');
    this.meta.updateTag({ name: 'description', content: 'Fotos, fichas técnicas e peças.' });
    this.meta.removeTag("name='robots'");
  }
}
