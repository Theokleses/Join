import {
  Component,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../firebase-services/contacts.service';
import { FormsModule } from '@angular/forms';
import { Icontacts } from '../../interfaces/icontacts';
import { Itasks } from '../../interfaces/itasks';
import { TasksService } from '../../firebase-services/tasks.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent {
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  @ViewChild('subtaskInputElement') subtaskInputElement!: ElementRef;
  @Input() targetStatus: string = 'todo'; // Empfängt den Status von BoardComponent
  @Output() taskAdded = new EventEmitter<void>();
  @Output() closeOverlay = new EventEmitter<void>();
  public contacts = inject(ContactsService);
  readonly date = new FormControl(new Date());
  readonly serializedDate = new FormControl(new Date().toISOString());

  taskForm: FormGroup;
  isDropdownOpen: boolean = false;
  selectedContactIds: string[] = [];
  searchQuery: string = '';
  filteredContacts: any[] = [];
  isUrgentClicked: boolean = false;
  isMediumClicked: boolean = true;
  isLowClicked: boolean = false;
  inputValue: string = '';
  subtasklist: string[] = [];
  inputSubtask: string = '';
  requiredInfo: boolean = false;
  newTaskAdded: boolean = false;
  isFadingOut: boolean = false;
  minDate: string;
  subtaskInputFocus: boolean = false;
  hoveredSubtaskIndex: number | null = null;
  editedSubtask: string = '';
  editingIndex: number | null = null;

  constructor(private fb: FormBuilder, private tasksService: TasksService) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[]],
      dueDate: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.filteredContacts = this.contacts.contactlist;
  }

  /** Initializes the component by setting up the task form with default values. */
  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[]],
      dueDate: [today, Validators.required],
      category: ['', Validators.required],
      prio: ['Medium'],
    });

    this.date.setValue(new Date(this.taskForm.value.dueDate));
  }

  /** Updates the date control with the selected date from the input element. */
  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = new Date(inputElement.value);
    this.date.setValue(selectedDate);
  }

  /** Toggles the checked status of a contact and updates the contact list. */
  checkContact(contactId: string, event: MouseEvent) {
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);
    if (contact) {
      contact.checked = !contact.checked;
      this.contacts.contactlist = [...this.contacts.contactlist];
      event.stopPropagation();
    }
  }

  /** Closes the dropdown if a click occurs outside of it. */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      this.inputValue = '';
    }
  }

  /** Filters contacts based on the search input and toggles the dropdown visibility. */
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.toLowerCase();
    if (inputValue) {
      this.filteredContacts = this.contacts.contactlist.filter((contact) =>
        contact.firstname.toLowerCase().startsWith(inputValue)
      );
      this.isDropdownOpen = true;
    } else {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  /** Toggles the visibility of the dropdown and focuses the search input. */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    setTimeout(() => this.inputSearch?.nativeElement.focus(), 0);
    if (this.isDropdownOpen) {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  /** Toggles the urgent priority and updates related states. */
  toggleUrgent() {
    this.isUrgentClicked = !this.isUrgentClicked;
    if (this.isMediumClicked) this.isMediumClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  /** Toggles the medium priority and updates related states. */
  toggleMedium() {
    this.isMediumClicked = !this.isMediumClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  /** Toggles the low priority and updates related states. */
  toggleLow() {
    this.isLowClicked = !this.isLowClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isMediumClicked) this.isMediumClicked = false;
  }

  /** Initiates editing mode for a subtask at the specified index. */
  startEditingSubtask(index: number) {
    this.editingIndex = index;
    this.editedSubtask = this.subtasklist[index];
  }

  /** Saves the edited subtask and exits editing mode. */
  saveEditedSubtask(index: number) {
    if (this.editedSubtask.trim()) {
      this.subtasklist[index] = this.editedSubtask;
    }
    this.editingIndex = null;
  }

  /** Sets the hovered subtask index for hover effects. */
  onSubtaskHover(index: number | null) {
    this.hoveredSubtaskIndex = index;
  }

  /** Focuses the subtask input element programmatically. */
  activateInput() {
    this.subtaskInputElement.nativeElement.focus();
  }

  /** Sets the subtask input focus state to true. */
  onSubtaskInputFocus() {
    this.subtaskInputFocus = true;
  }

  /** Sets the subtask input focus state to false. */
  onSubtaskInputBlur() {
    this.subtaskInputFocus = false;
  }

  /** Adds a new subtask to the list if the input is not empty. */
  addToSubtasklist(event?: MouseEvent) {
    if (event) event.preventDefault();
    if (this.inputSubtask.trim()) {
      this.subtasklist.push(this.inputSubtask.trim());
      this.inputSubtask = '';
    }
  }

  /** Adds a subtask to the list when the Enter key is pressed. */
  onSubtaskInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addToSubtasklist();
    }
  }

  /** Clears the subtask input field. */
  clearSubtaskInput(event: MouseEvent) {
    event.preventDefault();
    this.inputSubtask = '';
  }

  /** Removes a subtask from the list at the specified index. */
  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
  }

  /** Submits the task form if valid, otherwise shows required info. */
  onSubmit() {
    this.taskForm.markAllAsTouched();

    if (this.taskForm.valid) {
      const newTask = this.createNewTask();
      this.saveNewTask(newTask);
    } else {
      this.toggleRequiredInfo();
    }
  }

  /** Creates a new task object from the form values. */
  private createNewTask(): Itasks {
    const formValues = this.taskForm.value;
    return this.buildTaskObject(formValues);
  }

  /** Builds a task object with form values and additional properties. */
  private buildTaskObject(formValues: any): Itasks {
    const selectedContacts = this.getSelectedContacts();
    const prio = this.determinePriority();
    const dueDate = this.formatDueDate();

    return {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category as 'Technical Task' | 'User Story',
      dueDate: dueDate,
      prio: prio,
      assigned: selectedContacts,
      subtask: this.subtasklist,
      status: this.targetStatus,
    };
  }

  /** Retrieves the list of selected contacts. */
  private getSelectedContacts(): Icontacts[] {
    return this.contacts.contactlist.filter((contact) => contact.checked);
  }

  /** Determines the priority based on the clicked states. */
  private determinePriority(): 'Urgent' | 'Medium' | 'Low' {
    if (this.isUrgentClicked) return 'Urgent';
    if (this.isLowClicked) return 'Low';
    return 'Medium'; // Standardwert
  }

  /** Formats the due date to a locale string. */
  private formatDueDate(): string {
    return this.date.value ? this.date.value.toLocaleDateString() : '';
  }

  /** Saves the new task to the service and handles the response. */
  private saveNewTask(newTask: Itasks) {
    this.tasksService
      .addTask(newTask)
      .then(() => {
        this.handleTaskSaveSuccess();
      })
      .catch((error) => {
        this.handleTaskSaveError(error);
      });
  }

  /** Handles successful task save with animations and emits taskAdded. */
  private handleTaskSaveSuccess() {
    this.onClear();
    this.newTaskAdded = true;
    setTimeout(() => {
      this.isFadingOut = true;
    }, 500);
    setTimeout(() => {
      this.resetTaskAddedState();
    }, 500);
  }

  /** Logs an error if saving the task fails. */
  private handleTaskSaveError(error: any) {
    console.error('Fehler beim Hinzufügen des Tasks:', error);
  }

  /** Resets the task added state and emits the taskAdded event. */
  private resetTaskAddedState() {
    this.newTaskAdded = false;
    this.isFadingOut = false;
    this.taskAdded.emit();
  }

  /** Toggles the visibility of the required info message. */
  private toggleRequiredInfo() {
    this.requiredInfo = !this.requiredInfo;
  }

  /** Clears the form and component state. */
  onClear() {
    this.resetTaskForm();
    this.clearComponentState();
  }

  /** Resets the task form to its initial state. */
  private resetTaskForm() {
    const today = new Date().toISOString().split('T')[0];
    this.taskForm.reset({
      title: '',
      description: '',
      assigned: [],
      dueDate: today,
      category: '',
      prio: 'Medium',
      subtask: [],
    });
  }

  /** Clears the component state including contacts and priorities. */
  private clearComponentState() {
    this.uncheckAllContacts();
    this.filteredContacts = [...this.contacts.contactlist];
    this.selectedContactIds = [];
    this.isDropdownOpen = false;
    this.searchQuery = '';
    this.subtasklist = [];
    this.inputSubtask = '';
    this.setDefaultPriority();
    this.requiredInfo = false;
  }

  /** Unchecks all contacts in the contact list. */
  private uncheckAllContacts() {
    this.contacts.contactlist.forEach((contact) => (contact.checked = false));
  }

  /** Sets the default priority to Medium. */
  private setDefaultPriority() {
    this.isUrgentClicked = false;
    this.isMediumClicked = true;
    this.isLowClicked = false;
  }
}
