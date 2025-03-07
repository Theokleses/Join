import { Component, OnInit } from '@angular/core';
import { TasksService } from '../firebase-services/tasks.service';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Itasks } from '../interfaces/itasks';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  greetingMessage: string = '';
  initials: string = '';
  firstName: string = '';
  lastName: string = '';
  displayName: string = '';
  todo: Itasks[] = [];
  inProgress: Itasks[] = [];
  awaitFeedback: Itasks[] = [];
  done: Itasks[] = [];
  allTasks: Itasks[] = [];
  // nextTask: Itasks | null = null;
  nextTasks: Itasks[] = []; // Array für die nächsten Tasks
  nextDueDate: Date | null = null; // Nächstes Datum
  urgentTaskCount: number = 0; // Anzahl der Urgent-Tasks
  highestPriority: string = ''; // Höchste Priorität
  deadlineImgSrc: string = ''; // Bildquelle basierend auf der Priorität
  deadlineBgColor: string = '';
  editIconSrc: string = '../../assets/img/03_summary/edit.png';
  doneIconSrc: string = '../../assets/img/03_summary/done.png';

  constructor(
    private loginService: LoginService,
    private tasksService: TasksService,
  ) {}

  ngOnInit(): void {
    this.loginService.firstName$.subscribe((firstName) => {
      this.firstName = firstName;
    });

    this.loginService.lastName$.subscribe((lastName) => {
      this.lastName = lastName;
    });

    this.loginService.displayName$.subscribe((displayName) => {
      this.displayName = displayName;
      this.setGreetingMessage();
    });

    this.loadTasks();
  }

  private loadTasks() {
    this.tasksService.todo$.subscribe((tasks) => {
      this.todo = tasks;
      console.log('Todo Tasks:', this.todo);
      this.updateAllTasks();
    });

    this.tasksService.inProgress$.subscribe((tasks) => {
      this.inProgress = tasks;
      console.log('In Progress Tasks:', this.inProgress);
      this.updateAllTasks();
    });

    this.tasksService.awaitFeedback$.subscribe((tasks) => {
      this.awaitFeedback = tasks;
      console.log('Await Feedback Tasks:', this.awaitFeedback);
      this.updateAllTasks();
    });

    this.tasksService.done$.subscribe((tasks) => {
      this.done = tasks;
      console.log('Done Tasks:', this.done);
      this.updateAllTasks();
    });
  }

  private updateAllTasks() {
    this.allTasks = [
      ...this.todo,
      ...this.inProgress,
      ...this.awaitFeedback,
      ...this.done,
    ];
    console.log('All Tasks:', this.allTasks);
    // this.findNextTask();
    this.findNextTasks();
  }

  // private findNextTask() {
  //   if (this.allTasks.length > 0) {
  //     const sortedTasks = this.allTasks.slice().sort((a, b) => {
  //       const dateA = new Date(a.dueDate).getTime();
  //       const dateB = new Date(b.dueDate).getTime();
  //       return dateA - dateB;
  //     });

  //     this.nextTask = sortedTasks[0];
  //     console.log('Next Task:', this.nextTask);
  //   } else {
  //     this.nextTask = null;
  //   }
  // }

  private normalizeDate(dateString: string): string {
    // Prüfe, ob das Datum im Format YYYY-MM-DD vorliegt
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    // Andernfalls gehe davon aus, dass das Datum bereits im Format DD.MM.YYYY vorliegt
    return dateString;
  }

  // private parseDate(dateString: string): Date {
  //   const [day, month, year] = dateString.split('.').map(Number);
  //   return new Date(year, month - 1, day); // Monat ist 0-basiert (0 = Januar)
  // }

  private parseDate(dateString: string): Date {
    // Normalisiere das Datum (wandele YYYY-MM-DD in DD.MM.YYYY um, falls nötig)
    const normalizedDate = this.normalizeDate(dateString);

    // Zerlege das Datum in Tag, Monat und Jahr
    const [day, month, year] = normalizedDate.split('.').map(Number);

    // Erstelle ein Date-Objekt (Monat ist 0-basiert, daher month - 1)
    return new Date(year, month - 1, day);
  }

  private findNextTasks() {
    if (this.allTasks.length > 0) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const futureTasks = this.allTasks.filter((task) => {
        const taskDate = this.parseDate(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= currentDate;
      });

      if (futureTasks.length > 0) {
        // Sortiere Tasks nach Datum
        const sortedTasks = futureTasks.slice().sort((a, b) => {
          const dateA = this.parseDate(a.dueDate).getTime();
          const dateB = this.parseDate(b.dueDate).getTime();
          return dateA - dateB;
        });

        // Nächstes Datum ermitteln
        const nextDate = this.parseDate(sortedTasks[0].dueDate);
        this.nextDueDate = nextDate;

        // Alle Tasks mit dem nächsten Datum sammeln
        this.nextTasks = sortedTasks.filter(
          (task) =>
            this.parseDate(task.dueDate).getTime() === nextDate.getTime(),
        );

        // Priorität und Bildquelle festlegen
        this.determinePriorityAndImage();
      } else {
        // Keine zukünftigen Tasks gefunden
        this.nextTasks = [];
        this.nextDueDate = null;
        this.urgentTaskCount = 0;
        this.highestPriority = '';
        this.deadlineImgSrc = '';
      }
    } else {
      this.nextTasks = [];
      this.nextDueDate = null;
      this.urgentTaskCount = 0;
      this.highestPriority = '';
      this.deadlineImgSrc = '';
    }
  }

  private determinePriorityAndImage() {
    // Zähle die Tasks nach Priorität
    const urgentTasks = this.nextTasks.filter((task) => task.prio === 'Urgent');
    const mediumTasks = this.nextTasks.filter((task) => task.prio === 'Medium');
    const lowTasks = this.nextTasks.filter((task) => task.prio === 'Low');

    if (urgentTasks.length > 0) {
      this.urgentTaskCount = urgentTasks.length;
      this.highestPriority = 'Urgent';
      this.deadlineImgSrc = '../../assets/img/03_summary/urgent.png';
      this.deadlineBgColor = '#ff3d00';
    } else if (mediumTasks.length > 0) {
      this.urgentTaskCount = mediumTasks.length;
      this.highestPriority = 'Medium';
      this.deadlineImgSrc = '../../assets/img/03_summary/medium.png';
      this.deadlineBgColor = '#ffa800';
    } else if (lowTasks.length > 0) {
      this.urgentTaskCount = lowTasks.length;
      this.highestPriority = 'Low';
      this.deadlineImgSrc = '../../assets/img/03_summary/low.png';
      this.deadlineBgColor = '#7ae229';
    } else {
      this.urgentTaskCount = 0;
      this.highestPriority = '';
      this.deadlineImgSrc = '';
      this.deadlineBgColor = '';
    }
  }

  private setGreetingMessage() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingMessage = 'Good morning';
    } else if (hour < 18) {
      this.greetingMessage = 'Good afternoon';
    } else {
      this.greetingMessage = 'Good evening';
    }
  }

  onHoverEdit(isHovering: boolean) {
    this.editIconSrc = isHovering
      ? '../../assets/img/03_summary/edit-hover.png' // Bild beim Hovern
      : '../../assets/img/03_summary/edit.png'; // Standardbild
  }

  onHoverDone(isHovering: boolean) {
    this.doneIconSrc = isHovering
      ? '../../assets/img/03_summary/done-hover.png' // Bild beim Hovern
      : '../../assets/img/03_summary/done.png'; // Standardbild
  }
}
