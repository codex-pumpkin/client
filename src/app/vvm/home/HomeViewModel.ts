import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "Home.html",
  imports: [
    RouterOutlet,
    MatButton
  ],
  styleUrl: "Home.css"
})
export class HomeViewModel {

  private readonly router = inject(Router)

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
