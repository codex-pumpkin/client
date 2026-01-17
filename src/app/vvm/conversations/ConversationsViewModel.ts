import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

/**
 * ViewModel for the COnversations component.
 */
@Component({
  templateUrl: "Conversations.html",
  imports: [],
  styleUrl: "Conversations.css"
})
export class ConversationsViewModel implements OnInit {

  private readonly route = inject(ActivatedRoute)

  protected readonly conversationId = signal<string | null>(null)

  ngOnInit(): void {
    this.route.params
      .subscribe(params => {
        this.conversationId.set(params["id"])
      })
  }

}
