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
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { AddTaskComponent } from './add-task/add-task.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    FormsModule,
    TaskDetailComponent,
    AddTaskComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  public tasksService = inject(TasksService);
  public firestore = inject(Firestore);

  todo: Itasks[] = [];
  inProgress: Itasks[] = [];
  awaitFeedback: Itasks[] = [];
  done: Itasks[] = [];

  selectedTask: Itasks | null = null;
  isTasksOverlayOpen: boolean = false;
  targetStatus: string = 'todo';
  searchQuery: string = '';

  openAddTaskOverlay(status: string = 'todo') {
    this.targetStatus = status; // Speichere den Zielstatus
    this.isTasksOverlayOpen = true; // Öffne das Overlay
  }

  closeAddTaskOverlay() {
    this.isTasksOverlayOpen = false;
  }

  selectTask(task: Itasks) {
    this.selectedTask = { ...task };
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onDialogClosed() {
    this.selectedTask = null;
  }

  handleDialogToggle() {
    this.selectedTask = null;
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
      if (currentTask.id) {
        this.tasksService.updateTaskStatus(currentTask.id, event.container.id);
      }
    }
  }

  taskMatchesSearch(task: Itasks): boolean {
    if (!this.searchQuery) {
      return true;
    }
    const query = this.searchQuery.toLowerCase();
    return (
      (task.title || '').toLowerCase().includes(query) ||
      (task.description || '').toLowerCase().includes(query)
    );
  }

  getSubtaskProgress(task: Itasks): number {
    if (!task.subtask || task.subtask.length === 0) return 0;
    const subtaskStatus =
      task.subtaskStatus || new Array(task.subtask.length).fill(false);
    const completed = subtaskStatus.filter(Boolean).length;
    return (completed / task.subtask.length) * 100;
  }

  getSubtaskCount(task: Itasks): number {
    if (!task.subtask || task.subtask.length === 0) return 0;
    const subtaskStatus =
      task.subtaskStatus || new Array(task.subtask.length).fill(false);
    return subtaskStatus.filter(Boolean).length;
  }

  getInitials(firstname: string, lastname: string): string {
    return `${firstname?.charAt(0)?.toUpperCase() || ''}${
      lastname?.charAt(0)?.toUpperCase() || ''
    }`;
  }

  async deleteTask() {
    if (!this.selectedTask?.id) {
      console.error('Keine Task-ID zum Löschen gefunden.');
      return;
    }

    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.selectedTask.id);
      await deleteDoc(taskDocRef);
      this.selectedTask = null;
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments:', error);
    }
  }

  ngOnInit() {
    this.tasksService.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasksService.inProgress$.subscribe(
      (tasks) => (this.inProgress = tasks)
    );
    this.tasksService.awaitFeedback$.subscribe(
      (tasks) => (this.awaitFeedback = tasks)
    );
    this.tasksService.done$.subscribe((tasks) => (this.done = tasks));
  }
}
