import {Observable} from 'rxjs';
import {Analytics, QuotaConfig} from '../domain/domain_models';

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
