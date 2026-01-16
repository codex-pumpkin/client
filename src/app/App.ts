import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {AuthenticationService_T} from './model/authentication/AuthenticationService';
import {from} from 'rxjs';
import {EnvironmentLoader_T} from './environment/EnvironmentLoader';

@Component({
  selector: 'app-root',
  templateUrl: './App.html',
  imports: [
    RouterOutlet
  ],
  styleUrl: './app.css'
})
export class App implements OnInit {

  /**
   * The router.
   */
  private readonly router = inject(Router);

  /**
   * The auth service.
   */
  private readonly auth = inject(AuthenticationService_T)

  /**
   * The environment loader
   */
  private readonly env = inject(EnvironmentLoader_T)

  ngOnInit() {
    console.log(`Inside main app component.`)

    this.env.load().subscribe(success => {
      if (success) {
        this.refreshAccount()
      } else {
        console.error("Could not load environment variables")
      }
    })
  }

  private refreshAccount = () => {
    const accountRefresh$ = from(this.auth.refreshAccount())
    accountRefresh$.subscribe(this.performInitialNavigation)
  }

  private performInitialNavigation = () => {
    const account = this.auth.account$.getValue()
    // TODO: Here we perform the decision where the user should initially land.
    if (account) {
      this.router.navigate(["conversations"])
    } else {
      this.router.navigate(["login"])
    }
  }
}
