import {InformationService} from '../InformationService';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, tap} from 'rxjs';
import {Analytics, QuotaConfig} from '../../domain/domain_models';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';
import {NetworkClient_T} from '../../network/NetworkClient';
import {createAnalytics} from '../../authentication/internal/mapping';

@Injectable({
  providedIn: "root"
})
export class NetworkInformationService implements InformationService {

  auth = inject(AuthenticationService_T)

  api = inject(NetworkClient_T)

  analytics$: BehaviorSubject<Analytics | null> = new BehaviorSubject<Analytics | null>(null);
  quotaInfo$: BehaviorSubject<QuotaConfig> = new BehaviorSubject({admin: 0, member: 0});

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

  setQuota(quota: QuotaConfig): Observable<boolean> {
    const call = (token: string) => this.api.updateQuota$(quota, token)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

}
