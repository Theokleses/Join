import { Injectable, OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  QuerySnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { Itasks } from '../interfaces/itasks';
import { BehaviorSubject } from 'rxjs';
import { updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class TasksService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  unsubscribe: () => void;
  todo: Itasks[] = [];
  inProgress: Itasks[] = [];
  awaitFeedback: Itasks[] = [];
  done: Itasks[] = [];
  taskList: Itasks[] = [];

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'tasks'),
      (tasks: QuerySnapshot<DocumentData>) => {
        this.taskList = [];
        this.todo = [];
        this.inProgress = [];
        this.awaitFeedback = [];
        this.done = [];
        console.log(this.taskList);
        console.log(this.todo);
        console.log(this.inProgress);

        let index = 0;
        tasks.forEach((task) => {
          const taskData = task.data() as Itasks;
          const taskObject = this.setTaskObject(task.id, taskData, index);
          this.taskList.push(taskObject);
          this.categorizeTask(taskObject);
          index++;
        });
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  setTaskObject(id: string, data: any, index: number): Itasks {
    return {
      id: id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'todo',
    };
  }

  categorizeTask(task: Itasks) {
    if (task.status === 'todo') {
      this.todo.push(task);
    } else if (task.status === 'in progress') {
      this.inProgress.push(task);
    } else if (task.status === 'feedback') {
      this.awaitFeedback.push(task);
    } else if (task.status === 'done') {
      this.done.push(task);
    }
  }

  async updateTaskStatus(taskId: string, newStatus: string) {
    const taskDocRef = doc(this.firestore, `tasks/${taskId}`);
    await updateDoc(taskDocRef, { status: newStatus }).catch((error) => {
      console.error(error);
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
