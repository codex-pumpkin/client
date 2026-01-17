import {inject, Injectable} from '@angular/core';
import {AuthenticationService_T} from './model/authentication/AuthenticationService';
import {EnvironmentLoader_T} from './environment/EnvironmentLoader';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class AppInitializer {

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  /**
   * The environment loader
   */
  private readonly env = inject(EnvironmentLoader_T)

  async init(): Promise<void> {
    await firstValueFrom(this.env.load())
    await this.auth.refreshAccount()
  }

}
