import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideHttpClient, withFetch } from '@angular/common/http';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch()), { provide: LOCALE_ID, useValue: 'pt-BR' }],
};
