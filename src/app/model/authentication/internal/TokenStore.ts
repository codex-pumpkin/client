import {Injectable} from '@angular/core';

const KEY_ACCESS = "codex.localstorage.access"
const KEY_REFRESH = "codex.localstorage.refresh"

@Injectable({
  providedIn: "root"
})
export class TokenStore {

  /**
   * Sets the access token.
   * @param accessToken The access token
   */
  setAccess(accessToken: string | null) {
    if (accessToken) {
      localStorage.setItem(KEY_ACCESS, accessToken)
    } else {
      localStorage.removeItem(KEY_ACCESS)
    }
  }

  /**
   * Sets the refresh token.
   * @param refreshToken The refresh token
   */
  setRefresh(refreshToken: string | null) {
    if (refreshToken) {
      localStorage.setItem(KEY_REFRESH, refreshToken)
    } else {
      localStorage.removeItem(KEY_REFRESH)
    }
  }

  /**
   * Gets the access token.
   */
  getAccess(): string | null {
    return localStorage.getItem(KEY_ACCESS)
  }

  /**
   * Gets the access token.
   */
  getAccessOrEmpty(): string {
    return this.getAccess() ?? ""
  }

  /**
   * Gets the refresh token.
   */
  getRefresh(): string | null {
    return localStorage.getItem(KEY_REFRESH)
  }

  /**
   * Gets the refresh token.
   */
  getRefreshOrEmpty(): string {
    return this.getRefresh() ?? ""
  }

}
