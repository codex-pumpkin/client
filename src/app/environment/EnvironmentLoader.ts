import {Observable} from 'rxjs';
import {inject, InjectionToken} from '@angular/core';
import {AssetEnvironmentLoader} from './internal/AssetEnvironmentLoader';

/**
 * Interface that exposes functionality to load environment config.
 */
export interface EnvironmentLoader {

  /**
   * Initially loads the environment config.
   */
  load(): Observable<boolean>

  /**
   * Gets the loaded environment config.
   * Fail if 'load()' has not been called before.
   */
  get(): EnvironmentConfig

}

/**
 * The environment variables type.
 */
export type EnvironmentConfig = {

  /**
   * The serer base url.
   */
  SERVER_BASE_URL: string,

  /**
   * The google client id.
   */
  GOOGLE_CLIENT_ID: string

}

/**
 * Injection token for the EnvironmentLoader
 */
export const EnvironmentLoader_T = new InjectionToken<EnvironmentLoader>(
  'EnvironmentLoader',
  {
    providedIn: 'root',
    factory: () => inject(AssetEnvironmentLoader)
  }
)
