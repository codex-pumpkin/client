import {Component, inject, input} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {NgOptimizedImage} from '@angular/common';
import {MatCard, MatCardContent, MatCardTitle} from '@angular/material/card';

@Component({
  templateUrl: "CardLayout.html",
  styleUrl: "CardLayout.css",
  imports: [
    NgOptimizedImage,
    MatCard,
    MatCardTitle,
    MatCardContent
  ],
  selector: "card-layout"
})
export class CardLayout {

  private readonly breakpointObserver = inject(BreakpointObserver)

  private readonly isMobile$ = this.breakpointObserver
    .observe(Breakpoints.HandsetPortrait)
    .pipe(
      map(result => result.matches)
    )

  protected readonly isMobile = toSignal(this.isMobile$, {initialValue: false})

  readonly title = input<string>()
  readonly description = input<string>()
}
