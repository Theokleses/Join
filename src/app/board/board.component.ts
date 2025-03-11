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

  /**
   * Opens the add task overlay with the specified status.
   */

  openAddTaskOverlay(status: string = 'todo') {
    this.targetStatus = status; // Speichere den Zielstatus
    this.isTasksOverlayOpen = true; // Öffne das Overlay
  }

  /**
   * Closes the add task overlay.
   */

  closeAddTaskOverlay() {
    this.isTasksOverlayOpen = false;
  }

  /**
   * Selects a task and creates a copy for detailed view.
   */

  selectTask(task: Itasks) {
    this.selectedTask = { ...task };
  }

  /**
   * Prevents event propagation to the parent element.
   */

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Resets the selected task when the dialog is closed.
   */

  onDialogClosed() {
    this.selectedTask = null;
  }

  /**
   * Resets the selected task when the dialog is toggled.
   */

  handleDialogToggle() {
    this.selectedTask = null;
  }

  /**
   * Handles the drop event for drag-and-drop functionality.
   * Reorders or transfers tasks based on the container.
   */

  drop(event: CdkDragDrop<Itasks[]>) {
    if (this.isSameContainer(event)) {
      this.reorderWithinContainer(event);
    } else {
      this.transferBetweenContainers(event);
      this.updateTaskStatus(event);
    }
  }

  /**
   * Checks if the drop event occurred within the same container.
   * Returns true if the previous and current containers are the same.
   */

  private isSameContainer(event: CdkDragDrop<Itasks[]>): boolean {
    return event.previousContainer === event.container;
  }

  /**
   * Reorders items within the same container based on the drop event.
   */

  private reorderWithinContainer(event: CdkDragDrop<Itasks[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  /**
   * Transfers an item between different containers based on the drop event.
   */

  private transferBetweenContainers(event: CdkDragDrop<Itasks[]>) {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  /**
   * Updates the task status in the service when moved between containers.
   */

  private updateTaskStatus(event: CdkDragDrop<Itasks[]>) {
    const currentTask = event.container.data[event.currentIndex];
    if (currentTask.id) {
      this.tasksService.updateTaskStatus(currentTask.id, event.container.id);
    }
  }

  /**
   * Checks if a task matches the current search query.
   * Returns true if the task matches or no query is present.
   */

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

  /**
   * Calculates the progress percentage of completed subtasks.
   * Returns 0 if no subtasks exist.
   */

  getSubtaskProgress(task: Itasks): number {
    if (!task.subtask || task.subtask.length === 0) return 0;
    const subtaskStatus =
      task.subtaskStatus || new Array(task.subtask.length).fill(false);
    const completed = subtaskStatus.filter(Boolean).length;
    return (completed / task.subtask.length) * 100;
  }

  /**
   * Counts the number of completed subtasks.
   * Returns 0 if no subtasks exist.
   */

  getSubtaskCount(task: Itasks): number {
    if (!task.subtask || task.subtask.length === 0) return 0;
    const subtaskStatus = task.subtaskStatus || [];
    const validStatus = subtaskStatus.slice(0, task.subtask.length); // Kürze auf die kürzere Länge
    return validStatus.filter((status) => status).length; // Zähle nur abgeschlossene Subtasks
  }

  getInitials(firstname: string, lastname: string): string {
    return `${firstname?.charAt(0)?.toUpperCase() || ''}${
      lastname?.charAt(0)?.toUpperCase() || ''
    }`;
  }

  /**
   * Deletes the selected task from Firestore.
   * Resets the selected task on success and logs errors on failure.
   * Returns a promise that resolves when the deletion is complete.
   */

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

  /**
   * Truncates a description to 60 characters with an ellipsis if too long.
   * Returns an empty string if the description is undefined.
   */
  
  truncateDescription(description: string | undefined): string {
    if (!description) return '';
    return description.length > 60
      ? description.substring(0, 60) + '... ( read more)'
      : description;
  }

  /**
   * Initializes the component by subscribing to task service observables.
   */

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
