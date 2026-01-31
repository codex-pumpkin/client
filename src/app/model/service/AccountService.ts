import {Observable} from 'rxjs';
import {inject, InjectionToken} from '@angular/core';
import {NetworkAccountService} from './internal/NetworkAccountService';

/**
 * Interface that exposes functionality related to account data.
 */
export interface AccountService {

  /**
   * Observable with the updated profile picture blob.
   * This is up-to-date with the account$ property of the auth-service.
   */
  profilePicture$: Observable<Blob | null>

  /**
   * Updates the username of the current account.
   */
  updateUsername$(username: string): Observable<boolean>

  /**
   * Updates the profile picture of the current account.
   */
  updateProfilePicture(file: File): Observable<boolean>

  /**
   * Refreshes the current profile picture.
   */
  refreshProfilePicture(): Promise<boolean>

}

/**
 * Injection token for the AccountService.
 */
export const AccountService_T = new InjectionToken<AccountService>(
  'AccountService',
  {
    providedIn: 'root',
    factory: () => inject(NetworkAccountService)
  }
)
