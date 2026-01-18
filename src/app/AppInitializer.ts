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
    console.info(`Will start app initialization`)
    await firstValueFrom(this.env.load())
    console.info(`Finished environment loading and now got: ${JSON.stringify(this.env.get())}`)
    await this.auth.refreshAccount()
    console.info(`Finished account refreshing and now got: ${this.auth.account$.getValue()}`)
  }

}
