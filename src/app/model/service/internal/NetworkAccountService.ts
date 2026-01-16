import {AccountService} from '../AccountService';
import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, firstValueFrom, map, Observable, of} from 'rxjs';
import {NetworkClient_T} from '../../network/NetworkClient';
import {AuthenticationService_T} from '../../authentication/AuthenticationService';

@Injectable({
  providedIn: "root"
})
export class NetworkAccountService implements AccountService {

  api = inject(NetworkClient_T)

  auth = inject(AuthenticationService_T)

  profilePicture$: BehaviorSubject<Blob | null> = new BehaviorSubject<Blob | null>(null)

  constructor() {
    // Immediately when the service is started,
    // we listen to changes in the account$ property.
    // When that changes, we issue a refresh of the profile picture.
    this.auth.account$.subscribe(() => this.refreshProfilePicture())
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

  async refreshProfilePicture(): Promise<boolean> {
    const request$ = this.auth.safe(token => this.api.getProfilePicture$(token))
    const profilePicture = await firstValueFrom(request$)
    this.profilePicture$.next(profilePicture)

    return !!profilePicture
  }

  updateLLMConfig(id: string, name: string, url: string, token: string | null): Observable<boolean> {
    const call = (t: string) => this.api.updateLLMConfiguration$({name: name, api_url: url, api_key: token ?? undefined}, id, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  updateProfilePicture(file: File): Observable<boolean> {
    const formData = new FormData()
    formData.set("file", file)

    const call = (t: string) => this.api.updateProfilePicture$(formData, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  updateUsername$(username: string): Observable<boolean> {
    // Need to get current email to also sent it with the update request
    const currentEmail = this.auth.account$.getValue()?.email
    if(!currentEmail) { // If email is null, i.e. if not authenticated, we return unsuccessful.
      return of(false)
    }

    const call = (t: string) => this.api.updateAccount$({email: currentEmail, username: username}, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

}
