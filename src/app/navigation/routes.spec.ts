import { describe, expect, it } from 'vitest';
import { routes } from './routes';

describe('routes', () => {
  it('defines the public routes and the protected home children', () => {
    expect(routes[0]).toMatchObject({ path: '', redirectTo: 'home', pathMatch: 'full' });
    expect(routes[1]?.path).toBe('login');
    expect(routes[2]?.path).toBe('signup');
    expect(routes[3]?.path).toBe('email-not-verified');
    expect(routes[4]?.path).toBe('email-verification/:token');
    expect(routes[5]?.path).toBe('reset-password/:token');
    expect(routes[6]?.path).toBe('request-password-reset');

    const homeRoute = routes.find(route => route.path === 'home');
    expect(homeRoute?.children?.map(route => route.path)).toEqual([
      '',
      'conversations',
      'conversations/:id',
      'admin-panel',
      'settings',
    ]);
  });
});
