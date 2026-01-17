import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "Signup.html",
  imports: [
    MatButton
  ],
  styleUrl: "Signup.css"
})
export class SignupViewModel {

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
    this.router.navigate(["login"])
  }

  protected signup() {
    this.router.navigate(["home"])
  }

  protected googleAuth() {
  }

}
