import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { SettingsManager_T } from './model/settings/SettingsManager';

describe('App', () => {
  const settings$ = new BehaviorSubject({ isDarkMode: false, language: 'en' as const });

  beforeEach(() => {
    settings$.next({ isDarkMode: false, language: 'en' });
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsManager_T, useValue: { settings$ } },
      ],
    });
  });

  it('toggles the dark class on the root element when settings change', () => {
    const subject = TestBed.runInInjectionContext(() => new App());

    subject.ngOnInit();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    settings$.next({ isDarkMode: true, language: 'en' });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
