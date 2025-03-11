import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
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

  /**
   * Generates initials from the first name and last name.
   * Returns a string containing the uppercase first letters of the names.
   */

  getInitials(firstname: string, lastname: string): string {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Handles changes to the input task property and initializes related data.
   * Updates the idToDelete and showAnimation when a new task is provided.
   * Initializes subtaskStatus if subtask exists but status is missing.
   * Emits dialogClosed if task is null.
   */

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task && this.task.id) {
      this.idToDelete = this.task.id;
      this.showAnimation = true;
      if (this.task.subtask && !this.task.subtaskStatus) {
        this.task.subtaskStatus = new Array(this.task.subtask.length).fill(
          false
        );
        this.saveSubtaskStatus();
      }
    } else if (changes['task'] && !this.task) {
      this.dialogClosed.emit();
    }
  }

  /**
   * Toggles the completion status of a subtask and saves the update.
   * Returns a promise that resolves when the subtask status is saved.
   */

  async toggleSubtask(index: number) {
    if (this.task && this.task.subtask && this.task.subtaskStatus) {
      this.task.subtaskStatus[index] = !this.task.subtaskStatus[index];
      await this.saveSubtaskStatus();
    }
  }

  /**
   * Saves the current subtask status to Firestore for the associated task.
   * Returns a promise that resolves when the update is successful or rejects with an error.
   */

  async saveSubtaskStatus() {
    if (this.task?.id && this.task.subtaskStatus) {
      try {
        const taskDocRef = doc(this.firestore, 'tasks', this.task.id);
        await updateDoc(taskDocRef, {
          subtaskStatus: this.task.subtaskStatus,
        });
      } catch (error) {
        console.error('Error updating subtask status:', error);
      }
    }
  }

  /**
   * Deletes the task from Firestore using the stored idToDelete.
   * Emits dialogClosed on success and sets an error message on failure.
   * Returns a promise that resolves when the deletion is successful or rejects with an error.
   */

  async deleteTask() {
    if (!this.idToDelete) {
      this.deleteError = 'Keine Task-ID zum Löschen gefunden.';
      return;
    }
    try {
      const taskDocRef = doc(this.firestore, 'tasks', this.idToDelete);
      await deleteDoc(taskDocRef);
      this.deleteError = null;
      this.dialogClosed.emit();
    } catch (error) {
      this.deleteError =
        'Fehler beim Löschen des Tasks. Bitte versuche es erneut.';
    }
  }

  /**
   * Prevents event propagation to the parent element.
   */

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  /**
   * Emits the dialogClosed event to close the dialog.
   */

  handleDialogToggle() {
    this.dialogClosed.emit();
  }

  /**
   * Sets the component into editing mode if a task is available.
   */

  startEdit() {
    if (this.task) {
      this.isEditing = true;
    }
  }

  /**
   * Handles the completion of the task edit process.
   * Updates the task with the edited data and saves subtask status if needed.
   */

  onEditComplete(updatedTask: Itasks | null) {
    this.isEditing = false;
    if (updatedTask) {
      this.task = { ...updatedTask };
      if (this.task.subtask && this.needsSubtaskStatusUpdate()) {
        this.task.subtaskStatus = this.task.subtask.map(
          (_, i) => this.task?.subtaskStatus?.[i] || false
        );
        this.saveSubtaskStatus();
      }
    }
  }

  /**
   * Checks if the subtask status array needs to be updated based on the number of subtasks.
   * Returns true if the subtaskStatus is missing or has a different length than subtasks.
   */
  private needsSubtaskStatusUpdate(): boolean {
    return (
      !this.task?.subtaskStatus ||
      this.task.subtaskStatus.length !== this.task.subtask?.length
    );
  }
}
