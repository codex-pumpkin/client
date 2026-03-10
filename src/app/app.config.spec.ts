import { describe, expect, it } from 'vitest';
import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers the application providers', () => {
    expect(appConfig.providers?.length).toBeGreaterThan(0);
  });
});
