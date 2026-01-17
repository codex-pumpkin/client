import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "EmailNotVerified.html",
  imports: [],
  styleUrl: "EmailNotVerified.css"
})
export class EmailNotVerifiedViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  protected requestEmailVerification() {
    this.router.navigate(["login"])
  }

}
