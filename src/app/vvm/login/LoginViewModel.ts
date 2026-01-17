import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "Login.html",
  imports: [
    MatButton
  ],
  styleUrl: "Login.css"
})
export class LoginViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  protected togglePassword() {
  }

  protected resetPassword() {
    this.router.navigate(["request-password-reset"])
  }

  protected login() {
    this.router.navigate(["home"])
  }

  protected signup() {
    this.router.navigate(["signup"])
  }

  protected googleAuth() {
  }

}
