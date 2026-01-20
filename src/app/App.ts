import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './App.html',
  imports: [
    RouterOutlet,
    MatIconModule
  ],
  styleUrl: './app.css'
})
export class App {
}
