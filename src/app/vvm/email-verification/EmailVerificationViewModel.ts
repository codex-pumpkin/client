import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "EmailVerification.html",
  imports: [],
  styleUrl: "EmailVerification.css"
})
export class EmailVerificationViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  protected continue() {
    this.router.navigate([""])
  }

}
