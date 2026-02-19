import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {AppInitializer} from './AppInitializer';
import {routes} from './navigation/routes';
import {provideTranslateService} from '@ngx-translate/core';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideHttpClient(),
    provideRouter(routes),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en',
    }),
    provideAppInitializer(() => inject(AppInitializer).init()),
    provideAnimations()
  ],
};
