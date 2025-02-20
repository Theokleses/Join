import { Component, inject } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent {
  public tasks = inject(TasksService);
  constructor() {
    this.tasks;
  }
}
