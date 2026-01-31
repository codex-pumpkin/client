import {InformationService} from '../InformationService';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, tap} from 'rxjs';
import {Analytics, LLMConfig, QuotaConfig} from '../../domain/domain_models';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {NetworkClient_T} from '../../network/NetworkClient';
import {createAnalytics, createLlmConfig} from '../../authentication/internal/mapping';

@Injectable({
  providedIn: "root"
})
export class NetworkInformationService implements InformationService {

  auth = inject(AuthenticationService_T)

  api = inject(NetworkClient_T)

  analytics$: BehaviorSubject<Analytics | null> = new BehaviorSubject<Analytics | null>(null);
  quotaInfo$: BehaviorSubject<QuotaConfig> = new BehaviorSubject({admin: 0, member: 0});
  llmConfigurations$: BehaviorSubject<LLMConfig[] | null> = new BehaviorSubject<LLMConfig[] | null>(null);

  refreshAnalytics(): Observable<boolean> {
    const call = (token: string) => this.api.getAnalytics$(token)

    return this.auth.safe(call)
      .pipe(
        catchError(() => of(null)),
        tap(analytics => this.analytics$.next(analytics ? createAnalytics(analytics) : null)),
        map(analytics => !!analytics)
      )
  }

  refreshQuota(): Observable<boolean> {
    const call = (token: string) => this.api.getQuota$(token)

    return this.auth.safe(call)
      .pipe(
        tap(quota => this.quotaInfo$.next(quota)),
        map(() => true),
        catchError(() => of(false))
      )
  }

  refreshLLmConfigs(): Observable<boolean> {
    const call = (token: string) => this.api.getLLMConfigurations(token)

    return this.auth.safe(call)
      .pipe(
        catchError(() => of(null)),
        tap(configs => this.llmConfigurations$.next(configs ? configs.map(createLlmConfig) : null)),
        map(configs => !!configs)
      )
  }

  setQuota(quota: QuotaConfig): Observable<boolean> {
    const call = (token: string) => this.api.updateQuota$(quota, token)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  addLLMConfig(name: string, url: string, token: string | null): Observable<boolean> {
    const call = (t: string) => this.api.addLLMConfiguration$({name: name, api_url: url, api_key: token ?? undefined}, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  deleteLLMConfig$(id: string): Observable<boolean> {
    const call = (t: string) => this.api.deleteLLMConfiguration$(id, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  updateLLMConfig(id: string, name: string, url: string, token: string | null): Observable<boolean> {
    const call = (t: string) => this.api.updateLLMConfiguration$({name: name, api_url: url, api_key: token ?? undefined}, id, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

}
