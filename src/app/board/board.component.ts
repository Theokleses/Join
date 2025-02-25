import { Component, inject, OnInit } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';
import { CommonModule } from '@angular/common';
import { Itasks } from '../interfaces/itasks';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag],
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
    console.log('Drop-Handler wurde aufgerufen');
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
      const newStatus = event.container.id;

      if (currentTask.id && newStatus) {
        this.tasks
          .updateTaskStatus(currentTask.id, newStatus)
          .then(() => {})
          .catch((error) => {
            console.error('Fehler beim Update:', error);
          });
      } else {
        console.error('Task ID oder neuer Status fehlt:', {
          id: currentTask.id,
          newStatus,
        });
      }
    }
  }

  getCategoryClass(category: string): string {
    if (category === 'User Story') return 'darkblue';
    if (category === 'Technical Task') return 'blue';
    return 'default';
  }

  ngOnInit() {
    this.tasks.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasks.inProgress$.subscribe((tasks) => (this.inProgress = tasks));
    this.tasks.awaitFeedback$.subscribe(
      (tasks) => (this.awaitFeedback = tasks)
    );
    this.tasks.done$.subscribe((tasks) => (this.done = tasks));
    this.getCategoryClass;
  }
}
