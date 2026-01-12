import {Component, inject, OnInit, signal} from '@angular/core';
import {EnvironmentLoader_T} from './environment/EnvironmentLoader';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {

  private readonly environment = inject(EnvironmentLoader_T)

  ngOnInit() {
    this.environment.load()
      .subscribe(success => {
        console.log(`Loaded environment variables, success: ${success}`)
        if(success) {
          const env = this.environment.get()
          console.log(`Got server endpoint: ${env.SERVER_BASE_URL}`)
        }
      })
  }

  protected readonly title = signal('codex-client');
}
