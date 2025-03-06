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

  getInitials(firstname: string, lastname: string): string {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

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
      } catch (error) {
        console.error('Error updating subtask status:', error);
      }
    }
  }

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

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  handleDialogToggle() {
    this.dialogClosed.emit();
  }

  startEdit() {
    if (this.task) {
      this.isEditing = true;
    }
  }

  onEditComplete(updatedTask: Itasks | null) {
    if (updatedTask) {
      this.task = { ...updatedTask };
      if (
        this.task.subtask &&
        (!this.task.subtaskStatus ||
          this.task.subtaskStatus.length !== this.task.subtask.length)
      ) {
        const oldStatus = this.task.subtaskStatus || [];
        this.task.subtaskStatus = this.task.subtask.map(
          (_, i) => oldStatus[i] || false
        );
        this.saveSubtaskStatus();
      }
      this.isEditing = false;
    } else {
      this.isEditing = false;
    }
  }
}
