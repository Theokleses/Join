import { Injectable, OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  updateDoc,
  doc,
  addDoc,
} from '@angular/fire/firestore';
import { Itasks } from '../interfaces/itasks';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  unsubscribe: () => void;

  todo$ = new BehaviorSubject<Itasks[]>([]);
  inProgress$ = new BehaviorSubject<Itasks[]>([]);
  awaitFeedback$ = new BehaviorSubject<Itasks[]>([]);
  done$ = new BehaviorSubject<Itasks[]>([]);
  taskList$ = new BehaviorSubject<Itasks[]>([]);

  isEditing: boolean = false;
  isAdding: boolean = false;

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'tasks'),
      (tasks: QuerySnapshot<DocumentData>) => {
        const taskList: Itasks[] = [];
        const todo: Itasks[] = [];
        const inProgress: Itasks[] = [];
        const awaitFeedback: Itasks[] = [];
        const done: Itasks[] = [];

        let index = 0;
        tasks.forEach((task) => {
          const taskData = task.data() as Itasks;
          const taskObject = this.setTaskObject(task.id, taskData, index);
          taskList.push(taskObject);
          this.categorizeTask(
            taskObject,
            todo,
            inProgress,
            awaitFeedback,
            done
          );
          index++;
        });

        this.taskList$.next(taskList);
        this.todo$.next(todo);
        this.inProgress$.next(inProgress);
        this.awaitFeedback$.next(awaitFeedback);
        this.done$.next(done);
      },
      (error) => {
        console.error('Fehler beim Abrufen der Tasks:', error);
      }
    );
  }

  setTaskObject(id: string, data: any, index: number): Itasks {
    return {
      id: id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'todo',
      category: data.category,
      subtask: data.subtask,
      subtaskStatus: data.subtaskStatus,
      dueDate: data.dueDate,
      assigned: data.assigned,
      prio: data.prio,
    };
  }

  toggleDialogEdit() {
    this.isEditing = !this.isEditing;
  }

  toggleDialogAdd() {
    this.isAdding = !this.isAdding;
  }

  categorizeTask(
    task: Itasks,
    todo: Itasks[],
    inProgress: Itasks[],
    awaitFeedback: Itasks[],
    done: Itasks[]
  ) {
    if (task.status === 'todo') {
      todo.push(task);
    } else if (task.status === 'in-progress') {
      inProgress.push(task);
    } else if (task.status === 'await-feedback') {
      awaitFeedback.push(task);
    } else if (task.status === 'done') {
      done.push(task);
    }
  }

  async addTask(task: Itasks) {
    try {
      const tasksCollection = collection(this.firestore, 'tasks');
      const newTask = {
        ...task,
        subtask: task.subtask || [], 
        subtaskStatus: task.subtaskStatus || [],
      };
      const docRef = await addDoc(tasksCollection, newTask);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Tasks:', error);
    }
  }

  async updateTaskStatus(taskId: string, newStatus: string) {
    if (!taskId || !newStatus) {
      console.error('Ungültige Parameter für updateTaskStatus:', {
        taskId,
        newStatus,
      });
      return;
    }

    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    try {
      await updateDoc(taskDocRef, { status: newStatus });

    } catch (error) {
      console.error('Fehler beim Aktualisieren des Task-Status:', error);
    }
  }

  async updateTask(taskId: string, task: Itasks) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    try {
      const { id, ...updateData } = task;
      await updateDoc(taskDocRef, updateData);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Tasks:', error);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
