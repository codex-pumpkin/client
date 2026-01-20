import {Directive, inject, OnInit} from '@angular/core';
import {EnvironmentLoader_T} from '../../environment/EnvironmentLoader';

/**
 * Workaround for google-authentication typing.
 */
declare const google: any;

/**
 * Class performing configurations for google-authentication view-models.
 */
@Directive()
export abstract class GoogleAuthViewModel implements OnInit {

  /**
   * The environment loader.
   */
  private readonly env = inject(EnvironmentLoader_T)

  /**
   * The Google client.
   */
  private client: any

  /**
   * Handler for when a response has arrived.
   */
  protected abstract handleGoogleResponse(response: any): void

  ngOnInit() {
    this.client = google.accounts.oauth2.initCodeClient({
      client_id: this.env.get().GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: (response: any) => {
        console.info(`Received google code from google server.`);
        this.handleGoogleResponse(response)
      }
    });
  }

  /**
   * Opens the Google window to get the client code.
   */
  public openGoogleAuth() {
    this.client.requestCode()
  }

}
