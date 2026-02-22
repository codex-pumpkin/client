import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {SettingsManager_T} from './model/settings/SettingsManager';

@Component({
  selector: 'app-root',
  templateUrl: './App.html',
  imports: [
    RouterOutlet,
    MatIconModule
  ],
  styleUrl: './app.css'
})
export class App implements OnInit{

  private readonly settings = inject(SettingsManager_T)

  ngOnInit() {
    this.settings.settings$.subscribe(value => {
      document.documentElement.classList.toggle('dark', value.isDarkMode)
    })
  }

}
