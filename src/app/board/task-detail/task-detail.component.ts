import { Component, inject, Input } from '@angular/core';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';

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
  constructor() {
    this.tasks;
  }

  selectedTask: any = null;
  isEditing: boolean = false;
  isAdding: boolean = false;
}
