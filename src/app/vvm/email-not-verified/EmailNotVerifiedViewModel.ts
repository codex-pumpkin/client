import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {interval, map, scan, startWith, Subject, switchMap} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

const RESEND_INTERVAL = 60 // Allow resend every minute

/**
 * ViewModel for the email-not-verified component.
 */
@Component({
  templateUrl: "EmailNotVerified.html",
  imports: [
    ReactiveFormsModule,
    CardLayout,
    MatButton,
    TranslatePipe
  ],
  styleUrl: "EmailNotVerified.css"
})
export class EmailNotVerifiedViewModel {

  /**
   * The router.
   */
  private readonly router = inject(Router)

  /**
   * The current route.
   */
  private readonly route = inject(ActivatedRoute)

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  private readonly email$ = this.auth
    .account$
    .pipe(
      map(account => account?.email ?? "")
    )

  private readonly resetCountdown$ = new Subject<void>();

  private readonly timeLeftWaiting$ = this.resetCountdown$.pipe(
    startWith(0),              // start immediately
    switchMap(() =>
      interval(1000).pipe(
        scan((value) => Math.max(value - 1, 0), RESEND_INTERVAL),
        startWith(RESEND_INTERVAL)
      )
    )
  );

  /**
   * The time when a resend is possible again.
   */
  protected resendTimer = toSignal(this.timeLeftWaiting$, {initialValue: 0})

  /**
   * Whether the first email was sent.
   */
  protected readonly sentFirst = signal(false)

  /**
   * The email.
   */
  protected readonly email = toSignal(this.email$)

  protected sendEmail() {
    this.resetCountdown$.next()

    const reactYes = () => this.sentFirst.set(true)

    this.auth.requestEmailVerification$()
      .subscribe(maybe => {
        if (maybe.isYes) reactYes()
      })
  }

}
