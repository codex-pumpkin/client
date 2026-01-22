import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the Login component.
 */
@Component({
  templateUrl: "EmailVerification.html",
  imports: [
    CardLayout,
    TranslatePipe,
    MatButton
  ],
  styleUrl: "EmailVerification.css"
})
export class EmailVerificationViewModel implements OnInit {

  private readonly auth = inject(AuthenticationService_T)

  /**
   * Whether the verification was a success, or is just loading.
   */
  protected readonly isSuccess = signal<boolean | null>(null)

  /**
   * The router.
   */
  private readonly router = inject(Router);

  /**
   * The current route.
   */
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    const token = this.route.snapshot.params["token"] as string
    this.auth.submitEmailVerification$(token)
      .subscribe(res => {
        this.isSuccess.set(res.isYes)
      })
  }

  protected continue() {
    this.router.navigate([""])
  }

}
