import {Component, EventEmitter, Output} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  templateUrl: "GoogleButton.html",
  styleUrl: "GoogleButton.css",
  imports: [
    NgOptimizedImage,
    TranslatePipe
  ],
  selector: "google-button"
})
export class GoogleButton {

  /**
   * The handler for when the button is clicked
   */
  @Output()
  public clickHandler = new EventEmitter<void>();

}
