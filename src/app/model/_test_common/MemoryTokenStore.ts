import {TokenStore} from '../authentication/internal/TokenStore';

export class MemoryTokenStore implements TokenStore {

  private readonly storage = new Map<string, string>()

  getAccess(): string | null {
    return this.storage.get("access") ?? null
  }

  getAccessOrEmpty(): string {
    return this.getAccess() ?? ""
  }

  getRefresh(): string | null {
    return this.storage.get("refresh") ?? null
  }

  getRefreshOrEmpty(): string {
    return this.getRefresh() ?? ""
  }

  setAccess(accessToken: string | null): void {
    if (accessToken) {
      this.storage.set("access", accessToken)
    } else {
      this.storage.delete("access")
    }
  }

  setRefresh(refreshToken: string | null): void {
    if (refreshToken) {
      this.storage.set("refresh", refreshToken)
    } else {
      this.storage.delete("refresh")
    }
  }

}
