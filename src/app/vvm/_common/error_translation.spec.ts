import { describe, expect, it } from 'vitest';
import { Errors } from '../../model/domain/domain_models';
import { genericErrorTranslation } from './error_translation';

describe('genericErrorTranslation', () => {
  it('maps each generic error to its translation key', () => {
    expect(genericErrorTranslation(Errors.Connection)).toBe('errors.generic.connection');
    expect(genericErrorTranslation(Errors.Timeout)).toBe('errors.generic.timeout');
    expect(genericErrorTranslation(Errors.Permission)).toBe('errors.generic.permission');
    expect(genericErrorTranslation(Errors.Authentication)).toBe('errors.generic.authentication');
    expect(genericErrorTranslation(Errors.Unknown)).toBe('errors.generic.unknown');
  });
});
