import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "RequestPasswordReset.html",
  imports: [
    MatButton
  ],
  styleUrl: "RequestPasswordReset.css"
})
export class RequestPasswordResetViewModel implements OnInit {

  private readonly router = inject(Router)

  protected requestPasswordReset() {
    this.router.navigate(["login"])
  }

  ngOnInit(): void {
    console.log("Inside ngOnInit of RequestPasswordResetViewModel")
  }

}
