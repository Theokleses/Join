import { Component, inject, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent implements OnChanges {
  @Input() task: Itasks | null = null;
  @Output() dialogClosed = new EventEmitter<void>(); // Emit event to close dialog
  public tasks = inject(TasksService);
  public firestore: Firestore = inject(Firestore);

  updateSuccess: boolean = false;
  showAnimation: boolean = false;
  selectedTask: any = null;
  isShowing: boolean = false;
  idToDelete: string = '';

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
    }
  }

  deleteError: string | null = null;

  async deleteTask() {
    if (!this.idToDelete) {
      this.deleteError = 'Keine Task-ID zum Löschen gefunden.';
      console.log('delete task triggereeeeed, no ID');
      return;
    }

    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.idToDelete);
      await deleteDoc(taskDocRef);
      console.log('Task erfolgreich gelöscht:', this.idToDelete);
      this.task = null; // Reset task
      this.deleteError = null; // Clear error
      this.dialogClosed.emit(); // Emit event to notify parent to close overlay
    } catch (error) {
      this.deleteError = 'Fehler beim Löschen des Tasks. Bitte versuche es erneut.';
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  handleDialogToggle() {
    this.isShowing = false;
    this.selectedTask = null;
    this.dialogClosed.emit(); // Emit event when closing via the X button
    console.log('Dialog toggled, isShowing:', this.isShowing);
  }
}