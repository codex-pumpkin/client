import {Component, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {filter, map, tap} from 'rxjs';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {SettingsManager_T} from '../../model/settings/SettingsManager';
import {AuthenticationService_T} from '../../model/authentication/AuthenticationService';
import {AccountService_T} from '../../model/service/AccountService';
import {MatRipple} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "Home.html",
  imports: [
    MatIconButton,
    MatIcon,
    NgOptimizedImage,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    MatRipple,
    TranslatePipe
  ],
  styleUrl: "Home.css"
})
export class HomeViewModel {

  /**
   The breakpoint observer.
   **/
  private readonly breakpointObserver = inject(BreakpointObserver)

  /**
   * The settings.
   */
  private readonly settings = inject(SettingsManager_T)

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  /**
   * The account service.
   */
  private readonly accountService = inject(AccountService_T)

  private readonly router = inject(Router)

  private readonly isMobile$ = this.breakpointObserver
    .observe(Breakpoints.HandsetPortrait)
    .pipe(
      map(result => result.matches)
    )

  /**
   * Whether this runs on mobile.
   */
  protected readonly isMobile = toSignal(this.isMobile$, {initialValue: false})

  /**
   * The currently logged in account.
   */
  protected readonly account = toSignal(
    this.auth.account$
      .pipe(
        tap(account => {
          if (!account) {
            this.router.navigate([""])
          }
        }),
        filter(account => !!account)
      ),
    { initialValue: this.auth.account$.value! }
  )

  /**
   * The profile picture url
   */
  protected readonly profilePicture = toSignal(
    this.accountService.profilePicture$
      .pipe(
        filter(blob => !!blob),
        map(blob => URL.createObjectURL(blob))
      ),
    { initialValue: null }
  )

  /**
   * Whether dark mode is enabled
   */
  protected readonly isDark = toSignal(
    this.settings.settings$
      .pipe(
        map(settings => settings.isDarkMode)
      ),
    {initialValue: this.settings.settings$.value.isDarkMode}
  )

  /**
   * Whether the search s active right now.
   */
  protected readonly searchActive = signal(false)

  /**
   * The search input.
   */
  @ViewChild('search', { static: false }) searchElement!: ElementRef;

  protected toggleSearch() {
    this.searchActive.set(!this.searchActive())
    if(this.searchActive()) {
      setTimeout(() => (document.getElementsByClassName("search").item(0) as HTMLElement)?.focus(), 2)
    }
  }

  protected toggleDrawer() {

  }

  protected toggleDarkMode() {
    this.settings.setIsDarkMode(!this.settings.settings$.value.isDarkMode)
  }

  protected openSettings() {
    this.router.navigate(["home/settings"])
  }

  protected openAdmin() {
    this.router.navigate(["home/admin-panel"])
  }

  protected openConversation() {
    const id = "5eef3bec-9c15-4384-b8d1-f42a188684d0"
    this.router.navigate([`home/conversations/${id}`])
  }
}
