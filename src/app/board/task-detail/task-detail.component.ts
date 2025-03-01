import { Component, inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';
import { Firestore, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { TaskEditComponent } from './task-edit/task-edit.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [TaskEditComponent],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnChanges {
  @Input() task: Itasks | null = null;
  @Output() dialogClosed = new EventEmitter<void>();
  public tasks = inject(TasksService);
  public firestore: Firestore = inject(Firestore);

  isEditing: boolean = false;
  showAnimation: boolean = false;
  idToDelete: string = '';
  deleteError: string | null = null;

  getInitials(firstname: string, lastname: string): string {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task && this.task.id) {
      this.idToDelete = this.task.id;
      this.showAnimation = true;
      // Initialisiere subtaskStatus, falls nicht vorhanden
      if (this.task.subtask && !this.task.subtaskStatus) {
        this.task.subtaskStatus = new Array(this.task.subtask.length).fill(false);
        this.saveSubtaskStatus(); // Speichere Initialwert
      }
      console.log('Task loaded:', this.task);
    } else if (changes['task'] && !this.task) {
      console.log('Task cleared, closing dialog');
      this.dialogClosed.emit();
    }
  }

  async toggleSubtask(index: number) {
    if (this.task && this.task.subtask && this.task.subtaskStatus) {
      this.task.subtaskStatus[index] = !this.task.subtaskStatus[index];
      await this.saveSubtaskStatus();
    }
  }

  async saveSubtaskStatus() {
    if (this.task?.id && this.task.subtaskStatus) {
      try {
        const taskDocRef = doc(this.firestore, 'tasks', this.task.id);
        await updateDoc(taskDocRef, {
          subtaskStatus: this.task.subtaskStatus,
        });
        console.log('Subtask status updated for task:', this.task.id);
      } catch (error) {
        console.error('Error updating subtask status:', error);
      }
    }
  }

  async deleteTask() {
    if (!this.idToDelete) {
      this.deleteError = 'Keine Task-ID zum Löschen gefunden.';
      console.log('Delete task triggered, no ID');
      return;
    }

    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.idToDelete);
      await deleteDoc(taskDocRef);
      console.log('Task successfully deleted:', this.idToDelete);
      this.deleteError = null;
      this.dialogClosed.emit();
    } catch (error) {
      this.deleteError = 'Fehler beim Löschen des Tasks. Bitte versuche es erneut.';
      console.error('Error deleting document:', error);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  handleDialogToggle() {
    console.log('X button clicked, emitting dialogClosed');
    this.dialogClosed.emit();
  }

  startEdit() {
    if (this.task) {
      this.isEditing = true;
      console.log('Edit mode started, isEditing:', this.isEditing);
    }
  }

  onEditComplete(updatedTask: Itasks | null) {
    if (updatedTask) {
      this.task = { ...updatedTask };
      // Synchronisiere subtaskStatus nach Editieren
      if (this.task.subtask && (!this.task.subtaskStatus || this.task.subtaskStatus.length !== this.task.subtask.length)) {
        const oldStatus = this.task.subtaskStatus || [];
        this.task.subtaskStatus = this.task.subtask.map((_, i) => oldStatus[i] || false);
        this.saveSubtaskStatus();
      }
      this.isEditing = false;
      console.log('Task updated:', this.task);
    } else {
      this.isEditing = false;
    }
  }
}