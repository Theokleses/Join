import { Component, inject, OnInit } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';
import { CommonModule } from '@angular/common';
import { Itasks } from '../interfaces/itasks';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, CdkDropListGroup, CdkDropList, CdkDrag],
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

  drop(event: CdkDragDrop<Itasks[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const currentTask = event.container.data[event.currentIndex];

      console.log('Task ID ', currentTask.id);
      console.log('Old status ', currentTask.status);
      console.log('New status ', event.container.id);

      this.tasks.updateTaskStatus(currentTask.id!, event.container.id);
    }
  }

  ngOnInit() {
    this.tasks.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasks.inProgress$.subscribe((tasks) => (this.inProgress = tasks));
    this.tasks.awaitFeedback$.subscribe(
      (tasks) => (this.awaitFeedback = tasks)
    );
    this.tasks.done$.subscribe((tasks) => (this.done = tasks));
  }
}
