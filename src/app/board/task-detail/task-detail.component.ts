import { Component, inject, Input, OnInit } from '@angular/core';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';
import { Firestore, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
})
export class TaskDetailComponent {
  @Input() task: Itasks | null = null;
  public tasks = inject(TasksService);
  public firestore: Firestore = inject(Firestore);
  constructor() {
    this.tasks;
  }
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

  ngOnInit(): void {
    this.showAnimation = true;
  }

  deleteError: string | null = null;

  async deleteTask() {
    if (!this.idToDelete) {
      this.deleteError = 'Keine Task-ID zum Löschen gefunden.';
      return;
    }

    try {
      await deleteDoc(doc(this.firestore, 'tasks', this.idToDelete));
      console.log('Task erfolgreich gelöscht:', this.idToDelete);
      this.task = null; // Setze task zurück
      this.deleteError = null; // Fehlermeldung zurücksetzen
    } catch (error) {
      this.deleteError =
        'Fehler beim Löschen des Tasks. Bitte versuche es erneut.';
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  handleDialogToggle() {
    if (this.isShowing) {
      this.toggleDialogAdd(this.selectedTask);
    }
  }

  toggleDialogAdd(task: Itasks) {
    this.isShowing = !this.isShowing;
    console.log('clickeddddddd adddddd');
    this.selectedTask = task;
  }
}
