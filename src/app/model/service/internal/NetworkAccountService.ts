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

  async refreshProfilePicture(): Promise<boolean> {
    const request$ = this.auth.safe(token => this.api.getProfilePicture$(token))
    const profilePicture = await firstValueFrom(request$)
    this.profilePicture$.next(profilePicture)

    return !!profilePicture
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

  updateEmail$(email: string): Observable<boolean> {
    // Need to get current username to also sent it with the update request
    const currentUsername = this.auth.account$.getValue()?.username
    if(!currentUsername) { // If username is null, i.e. if not authenticated, we return unsuccessful.
      return of(false)
    }

    const call = (t: string) => this.api.updateAccount$({email: email, username: currentUsername}, t)

    return this.auth.safe(call)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

}
