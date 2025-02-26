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
import { FormsModule } from '@angular/forms'; // Für ngModel

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule],
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

  isOverlayOpen: boolean = false;
  selectedTask: Itasks | null = null;

  openTaskOverlay(task: Itasks) {
    this.selectedTask = task;
    this.isOverlayOpen = true;
  }

  closeOverlay(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isOverlayOpen = false;
    this.selectedTask = null;
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

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

  getSubtaskProgress(subtask: string[] | undefined): number {
    if (!subtask || subtask.length === 0) return 0;
    return 0;
  }

  getSubtaskCount(subtask: string[] | undefined): number {
    if (!subtask || subtask.length === 0 || !subtask.length) return 0;
    return 0;
  }

  getInitials(firstname: string, lastname: string): string {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  getCategoryClass(category: string): string {
    if (category === 'User Story') return 'darkblue';
    if (category === 'Technical Task') return 'blue';
    return 'default';
  }

  saveTaskChanges() {
    if (this.selectedTask && this.selectedTask.id) {
      this.tasks.updateTask(this.selectedTask.id, this.selectedTask);
      console.log('Task geändert und gespeichert:', this.selectedTask);
    }
  }

  ngOnInit() {
    this.tasks.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasks.inProgress$.subscribe((tasks) => (this.inProgress = tasks));
    this.tasks.awaitFeedback$.subscribe(
      (tasks) => (this.awaitFeedback = tasks)
    );
    this.tasks.done$.subscribe((tasks) => (this.done = tasks));
    this.getCategoryClass;
    this.getSubtaskProgress;
    this.getSubtaskCount;
  }
}
