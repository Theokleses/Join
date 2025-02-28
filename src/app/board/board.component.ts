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

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDrag,
    FormsModule,
    TaskDetailComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  public tasks = inject(TasksService);
  public firestore: Firestore = inject(Firestore);

  todo: Itasks[] = [];
  inProgress: Itasks[] = [];
  awaitFeedback: Itasks[] = [];
  done: Itasks[] = [];

  selectedTask: Itasks | null = null;

  selectTask(task: Itasks) {
    this.selectedTask = { ...task }; // Create a copy to avoid direct mutation
    console.log('Selected Task:', this.selectedTask);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  onDialogClosed() {
    console.log('Dialog closed event received, clearing selectedTask');
    this.selectedTask = null; // Close the overlay
  }

  handleDialogToggle() {
    console.log('Overlay clicked, clearing selectedTask');
    this.selectedTask = null; // Close the overlay when clicking outside
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
    return 0; // Implement logic if needed
  }

  getSubtaskCount(subtask: string[] | undefined): number {
    if (!subtask || subtask.length === 0) return 0;
    return 0; // Implement logic if needed
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

  async deleteTask() {
    if (!this.selectedTask || !this.selectedTask.id) {
      console.error('Keine Task-ID zum Löschen gefunden.');
      return;
    }

    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.selectedTask.id);
      await deleteDoc(taskDocRef);
      console.log('Task erfolgreich gelöscht:', this.selectedTask.id);

      // Remove task from the respective array
      const taskArrays = [this.todo, this.inProgress, this.awaitFeedback, this.done];
      for (const array of taskArrays) {
        const index = array.findIndex(t => t.id === this.selectedTask?.id);
        if (index !== -1) {
          array.splice(index, 1);
          break;
        }
      }

      this.selectedTask = null; // Clear selected task
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  ngOnInit() {
    this.tasks.todo$.subscribe((tasks) => (this.todo = tasks));
    this.tasks.inProgress$.subscribe((tasks) => (this.inProgress = tasks));
    this.tasks.awaitFeedback$.subscribe((tasks) => (this.awaitFeedback = tasks));
    this.tasks.done$.subscribe((tasks) => (this.done = tasks));
  }
}