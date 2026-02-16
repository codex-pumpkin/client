import {BehaviorSubject, Observable} from 'rxjs';
import {Analytics, LLMConfig, QuotaConfig} from '../domain/domain_models';
import {inject, InjectionToken} from '@angular/core';
import {NetworkInformationService} from './internal/NetworkInformationService';

export interface InformationService {

  /**
   * The current quota config.
   */
  quotaInfo$: BehaviorSubject<QuotaConfig>

  /**
   * The current analytics. Only present when the authentication is an admin.
   */
  analytics$: BehaviorSubject<Analytics | null>

  /**
   * The currently existing llm-configs.
   * Only present when the authentication is an admin.
   */
  llmConfigurations$: BehaviorSubject<LLMConfig[] | null>

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

  /**
   * Adds an llm-configuration to the current account.
   */
  addLLMConfig(name: string, modelName: string, url: string, token: string | null): Observable<boolean>

  /**
   * Updates a specific llm-configuration.
   */
  updateLLMConfig(id: string, name: string, modelName: string, url: string, token: string | null): Observable<boolean>

  /**
   * Deletes an llm-configuration.
   */
  deleteLLMConfig$(id: string): Observable<boolean>

  /**
   * Refreshes the current llm configs.
   */
  refreshLLmConfigs(): Observable<boolean>

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
