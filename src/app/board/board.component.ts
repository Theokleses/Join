import { Component, inject, OnInit } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';
import { CommonModule } from '@angular/common';
import { Itasks } from '../interfaces/itasks';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  public tasks = inject(TasksService);
  constructor() {
    this.tasks;
  }

  todo: Itasks[] = [];
  inProgress: Itasks[] = [];
  awaitFeedback: Itasks[] = [];
  done: Itasks[] = [];

  ngOnInit() {
    this.tasks.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasks.inProgress$.subscribe((tasks) => (this.inProgress = tasks));
    this.tasks.awaitFeedback$.subscribe((tasks) => (this.awaitFeedback = tasks));
    this.tasks.done$.subscribe((tasks) => (this.done = tasks));
  }
}
