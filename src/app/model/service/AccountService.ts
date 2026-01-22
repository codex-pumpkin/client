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
   * Adds an llm-configuration to the current account.
   */
  addLLMConfig(name: string, url: string, token: string | null): Observable<boolean>

  /**
   * Updates a specific llm-configuration.
   */
  updateLLMConfig(id: string, name: string, url: string, token: string | null): Observable<boolean>

  /**
   * Deletes an llm-configuration.
   */
  deleteLLMConfig$(id: string): Observable<boolean>

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
