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
  isEditing: boolean = false;
  isAdding: boolean = false;
  showEditDelete: boolean = false;
  idToDelete: string = '';

  getInitials(firstname: string, lastname: string): string {
    const firstInitial = firstname ? firstname.charAt(0).toUpperCase() : '';
    const lastInitial = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  ngOnInit(): void {
    this.showAnimation = true;
  }

  async deleteTask() {
    try {
      await deleteDoc(doc(this.firestore, 'tasks', this.idToDelete));
      this.selectedTask = null;
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  toggleEditDelete() {
    this.showEditDelete = !this.showEditDelete;
  }
}
