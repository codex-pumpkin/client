import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { CardLayout } from './CardLayout';

describe('CardLayout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: true }),
          },
        },
      ],
    });
  });

  it('tracks the mobile breakpoint through its signal inputs context', () => {
    const subject = TestBed.runInInjectionContext(() => new CardLayout());

    expect((subject as any).isMobile()).toBe(true);
  });
});
