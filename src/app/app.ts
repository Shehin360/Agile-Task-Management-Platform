import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Kanban } from './kanban/kanban';

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [Kanban],
  template: '<app-kanban />',
  // styleUrl: './app.css'
})
export class App {
protected readonly title = signal('Agile Management');  
}
