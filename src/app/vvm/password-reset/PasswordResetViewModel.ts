import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "PasswordReset.html",
  imports: [
    MatButton
  ],
  styleUrl: "PasswordReset.css"
})
export class PasswordResetViewModel {

  private readonly router = inject(Router)

  protected resetPassword() {
    this.router.navigate(["login"])
  }

}
