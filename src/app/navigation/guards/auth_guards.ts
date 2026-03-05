import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';

@Injectable({
  providedIn: "root"
})
export class AccountAuthGuard implements CanActivate {

  /**
   * The auth service
   */
  public auth = inject(AuthenticationService_T)

  /**
   * The router
   */
  private readonly router = inject(Router)

  canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
    const account = this.auth.account$.getValue()

    if (account) { // If account is given, we allow
      return true
    } else { // If account is required but not given, we redirect to /login
      return this.router.createUrlTree(["login"])
    }
  }
}

@Injectable({
  providedIn: "root"
})
export class VerifiedAuthGuard implements CanActivate {

  /**
   * The auth service
   */
  public auth = inject(AuthenticationService_T)

  /**
   * The router
   */
  private readonly router = inject(Router)

  canActivate = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
    const account = this.auth.account$.getValue()

    if (!account) { // If account is required but not given, we redirect to /login
      return this.router.createUrlTree(["login"])
    } else if (account.isVerified) {
      return true
    } else { // If account is given, we allow
      return this.router.createUrlTree(["email-not-verified"])
    }
  }
}
