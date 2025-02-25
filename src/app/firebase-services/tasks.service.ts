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

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'tasks'),
      (tasks: QuerySnapshot<DocumentData>) => {
        console.log(
          'Neue Tasks von Firestore:',
          tasks.docs.map((doc) => doc.data())
        );
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
      assigned: data.assigned,
      prio: data.prio,
    };
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
      console.log(
        `Task ${taskId} erfolgreich auf Status ${newStatus} aktualisiert`
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Task-Status:', error);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
