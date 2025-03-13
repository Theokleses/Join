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
  nextTasks: Itasks[] = [];
  nextDueDate: Date | null = null;
  urgentTaskCount: number = 0;
  highestPriority: string = '';
  deadlineImgSrc: string = '';
  deadlineBgColor: string = '';
  editIconSrc: string = './assets/img/03_summary/edit.png';
  doneIconSrc: string = './assets/img/03_summary/done.png';

  constructor(
    private loginService: LoginService,
    private tasksService: TasksService,
  ) {}

  /**
   * Initializes the component and subscribes to the necessary observables.
   */
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

  /**
   * Loads tasks from the TasksService and updates the task lists.
   */
  private loadTasks() {
    this.tasksService.todo$.subscribe((tasks) => {
      this.todo = tasks;
      this.updateAllTasks();
    });

    this.tasksService.inProgress$.subscribe((tasks) => {
      this.inProgress = tasks;
      this.updateAllTasks();
    });

    this.tasksService.awaitFeedback$.subscribe((tasks) => {
      this.awaitFeedback = tasks;
      this.updateAllTasks();
    });

    this.tasksService.done$.subscribe((tasks) => {
      this.done = tasks;
      this.updateAllTasks();
    });
  }

  /**
   * Updates the list of all tasks and finds the next tasks.
   */
  private updateAllTasks() {
    this.allTasks = [
      ...this.todo,
      ...this.inProgress,
      ...this.awaitFeedback,
      ...this.done,
    ];
    this.findNextTasks();
  }

  /**
   * Normalizes the date format from 'YYYY-MM-DD' to 'DD.MM.YYYY'.
   * @param {string} dateString - The date in 'YYYY-MM-DD' format.
   * @returns {string} - The normalized date in 'DD.MM.YYYY' format.
   */
  private normalizeDate(dateString: string): string {
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    }
    return dateString;
  }

  /**
   * Parses a date string in 'DD.MM.YYYY' format into a Date object.
   * @param {string} dateString - The date as a string.
   * @returns {Date} - The parsed Date object.
   */
  private parseDate(dateString: string): Date {
    const normalizedDate = this.normalizeDate(dateString);
    const [day, month, year] = normalizedDate.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Finds the next tasks based on their due dates.
   */
  private findNextTasks() {
    const relevantTasks = this.getRelevantTasks();
    this.processTasks(relevantTasks);
  }

  /**
   * Returns the relevant tasks (excluding 'done' tasks).
   * @returns {Itasks[]} - The relevant tasks.
   */
  private getRelevantTasks() {
    return [...this.todo, ...this.inProgress, ...this.awaitFeedback];
  }

  /**
   * Processes the relevant tasks and filters for future tasks.
   * @param {Itasks[]} relevantTasks - The relevant tasks.
   */
  private processTasks(relevantTasks: Itasks[]) {
    if (relevantTasks.length > 0) {
      const futureTasks = this.filterFutureTasks(relevantTasks);
      this.handleFutureTasks(futureTasks);
    } else {
      this.resetTaskProperties();
    }
  }

  /**
   * Filters tasks that have a due date in the future.
   * @param {Itasks[]} tasks - The tasks to filter.
   * @returns {Itasks[]} - The filtered future tasks.
   */
  private filterFutureTasks(tasks: Itasks[]) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      const taskDate = this.parseDate(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= currentDate;
    });
  }

  /**
   * Handles the future tasks and sets the corresponding properties.
   * @param {Itasks[]} futureTasks - The future tasks.
   */
  private handleFutureTasks(futureTasks: Itasks[]) {
    if (futureTasks.length > 0) {
      const sortedTasks = this.sortTasksByDate(futureTasks);
      this.setNextTasksAndDate(sortedTasks);
      this.determinePriorityAndImage();
    } else {
      this.resetTaskProperties();
    }
  }

  /**
   * Sorts tasks by their due date.
   * @param {Itasks[]} tasks - The tasks to sort.
   * @returns {Itasks[]} - The sorted tasks.
   */
  private sortTasksByDate(tasks: Itasks[]) {
    return tasks.slice().sort((a, b) => {
      const dateA = this.parseDate(a.dueDate).getTime();
      const dateB = this.parseDate(b.dueDate).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Sets the next due date and the corresponding tasks.
   * @param {Itasks[]} sortedTasks - The sorted tasks.
   */
  private setNextTasksAndDate(sortedTasks: Itasks[]) {
    const nextDate = this.parseDate(sortedTasks[0].dueDate);
    this.nextDueDate = nextDate;
    this.nextTasks = sortedTasks.filter(
      (task) => this.parseDate(task.dueDate).getTime() === nextDate.getTime(),
    );
  }

  /**
   * Resets the task properties if no future tasks are found.
   */
  private resetTaskProperties() {
    this.nextTasks = [];
    this.nextDueDate = null;
    this.urgentTaskCount = 0;
    this.highestPriority = '';
    this.deadlineImgSrc = '';
  }

  /**
   * Determines the priority and image based on the next tasks.
   */
  private determinePriorityAndImage() {
    const urgentTasks = this.filterTasksByPriority('Urgent');
    const mediumTasks = this.filterTasksByPriority('Medium');
    const lowTasks = this.filterTasksByPriority('Low');

    this.setPriorityAndImage(urgentTasks, mediumTasks, lowTasks);
  }

  /**
   * Filters tasks by priority.
   * @param {string} priority - The priority to filter by.
   * @returns {Itasks[]} - The filtered tasks.
   */
  private filterTasksByPriority(priority: string) {
    return this.nextTasks.filter((task) => task.prio === priority);
  }

  /**
   * Sets the properties based on the priority of the tasks.
   * @param {Itasks[]} urgentTasks - The urgent tasks.
   * @param {Itasks[]} mediumTasks - The medium-priority tasks.
   * @param {Itasks[]} lowTasks - The low-priority tasks.
   */
  private setPriorityAndImage(
    urgentTasks: any[],
    mediumTasks: any[],
    lowTasks: any[],
  ) {
    if (urgentTasks.length > 0) {
      this.setTaskProperties(
        urgentTasks.length,
        'Urgent',
        './assets/img/03_summary/urgent.png',
        '#ff3d00',
      );
    } else if (mediumTasks.length > 0) {
      this.setTaskProperties(
        mediumTasks.length,
        'Medium',
        './assets/img/03_summary/medium.png',
        '#ffa800',
      );
    } else if (lowTasks.length > 0) {
      this.setTaskProperties(
        lowTasks.length,
        'Low',
        './assets/img/03_summary/low.png',
        '#7ae229',
      );
    } else {
      this.setTaskProperties(0, '', '', '');
    }
  }

  /**
   * Sets the properties for displaying the priority.
   * @param {number} count - The number of tasks.
   * @param {string} priority - The priority.
   * @param {string} imgSrc - The image source.
   * @param {string} bgColor - The background color.
   */
  private setTaskProperties(
    count: number,
    priority: string,
    imgSrc: string,
    bgColor: string,
  ) {
    this.urgentTaskCount = count;
    this.highestPriority = priority;
    this.deadlineImgSrc = imgSrc;
    this.deadlineBgColor = bgColor;
  }

  /**
   * Sets the greeting message based on the current time of day.
   */
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

  /**
   * Changes the edit icon when hovering over it.
   * @param {boolean} isHovering - Indicates whether the mouse is over the element.
   */
  onHoverEdit(isHovering: boolean) {
    this.editIconSrc = isHovering
      ? './assets/img/03_summary/edit-hover.png'
      : './assets/img/03_summary/edit.png';
  }

  /**
   * Changes the done icon when hovering over it.
   * @param {boolean} isHovering - Indicates whether the mouse is over the element.
   */
  onHoverDone(isHovering: boolean) {
    this.doneIconSrc = isHovering
      ? './assets/img/03_summary/done-hover.png'
      : './assets/img/03_summary/done.png';
  }
}
