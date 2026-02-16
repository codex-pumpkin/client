import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CardLayout} from '../_common/card-layout/CardLayout';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * ViewModel for the email-not-verified component.
 */
@Component({
  templateUrl: "EmailNotVerified.html",
  imports: [
    ReactiveFormsModule,
    CardLayout,
    TranslatePipe
  ],
  styleUrl: "EmailNotVerified.css"
})
export class EmailNotVerifiedViewModel {
}
