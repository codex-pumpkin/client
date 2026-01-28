import {Observable} from 'rxjs';
import {Analytics, QuotaConfig} from '../domain/domain_models';
import {inject, InjectionToken} from '@angular/core';
import {NetworkInformationService} from './internal/NetworkInformationService';

export interface InformationService {

  /**
   * The current quota config.
   */
  quotaInfo$: Observable<QuotaConfig>

  /**
   * The current analytics. Only present when the authentication is an admin.
   */
  analytics$: Observable<Analytics | null>

  /**
   * Sets the quota config.
   */
  setQuota(quota: QuotaConfig): Observable<boolean>

  /**
   * Refreshes the current quota.
   */
  refreshQuota(): Observable<boolean>

  /**
   * Refreshes the current analytics.
   */
  refreshAnalytics(): Observable<boolean>

}

/**
 * Injection token for the InformationService
 */
export const InformationService_T = new InjectionToken<InformationService>(
  'InformationService',
  {
    providedIn: 'root',
    factory: () => inject(NetworkInformationService)
  }
)
