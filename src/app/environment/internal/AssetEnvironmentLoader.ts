import {EnvironmentConfig, EnvironmentLoader} from '../EnvironmentLoader';
import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';

// Path where the environment variables json file is placed on container startup.
const ASSET_ENV_PATH = '/assets/env.json'

@Injectable({
  providedIn: 'root'
})
export class AssetEnvironmentLoader implements EnvironmentLoader {

  private readonly client = inject(HttpClient)

  private config?: EnvironmentConfig

  get(): EnvironmentConfig {
    if(this.config) {
      return this.config
    } else {
      throw new Error("Requested environment config without successfully calling load() before.")
    }
  }

  load(): Observable<boolean> {
    return this.client.get<EnvironmentConfig>(ASSET_ENV_PATH)
      .pipe(
        tap(config => this.config = config),
        catchError(_ => of(false)),
        map(c => !!c)
      )
  }

}
