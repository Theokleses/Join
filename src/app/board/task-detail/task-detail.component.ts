import { Component, inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { TaskEditComponent } from "./task-edit/task-edit.component";

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
      this.idToDelete = this.task.id; // Update idToDelete when task input changes
      this.showAnimation = true;
      console.log('Task ID set to:', this.idToDelete);
    } else if (changes['task'] && !this.task) {
      console.log('Task cleared, closing dialog');
      this.dialogClosed.emit(); // Ensure dialog closes if task is null
    }
  }

  async deleteTask() {
    if (!this.idToDelete) {
      this.deleteError = 'Keine Task-ID zum Löschen gefunden.';
      console.log('delete task triggered, no ID');
      return;
    }

    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.idToDelete);
      await deleteDoc(taskDocRef);
      console.log('Task successfully deleted:', this.idToDelete);
      this.deleteError = null; // Clear error
      this.dialogClosed.emit(); // Notify parent to close overlay
    } catch (error) {
      this.deleteError = 'Fehler beim Löschen des Tasks. Bitte versuche es erneut.';
      console.error('Error deleting document: ', error);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  handleDialogToggle() {
    console.log('X button clicked, emitting dialogClosed');
    this.dialogClosed.emit(); // Emit event to close dialog
  }

  startEdit() {
    if (this.task) {
      this.isEditing = true;
      console.log('Edit mode started, isEditing:', this.isEditing);
    }
  }

  onEditComplete(updatedTask: Itasks | null) {
    if (updatedTask) {
      this.task = { ...updatedTask }; // Aktualisiere das lokale task-Objekt
      this.isEditing = false; // Zurück zur Anzeigemodus
      console.log('Task updated:', this.task);
    } else {
      this.isEditing = false; // Abbrechen ohne Speichern
    }}
}