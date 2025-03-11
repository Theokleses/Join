import {
  Component,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
  Output,
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
import { ContactsService } from '../firebase-services/contacts.service';
import { FormsModule } from '@angular/forms';
import { Icontacts } from '../interfaces/icontacts';
import { Itasks } from '../interfaces/itasks';
import { TasksService } from '../firebase-services/tasks.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  @ViewChild('subtaskInputElement') subtaskInputElement!: ElementRef;
  @Output() taskAdded = new EventEmitter<void>(); // Event für erfolgreiches Hinzufügen
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

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tasksService: TasksService,
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.contacts;
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[]],
      dueDate: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.filteredContacts = this.contacts.contactlist;
  }

  /**
   * Initializes the component after Angular has initialized all data-bound properties.
   * Sets up the task form with default values and initializes the due date with today's date.
   */
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

  /**
   * Handles the change event of the due date input field.
   * Updates the date FormControl with the selected date.
   *
   * @param {Event} event - The event object from the date input field.
   */
  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = new Date(inputElement.value);
    this.date.setValue(selectedDate);
  }

  /**
   * Retrieves the list of currently selected contacts.
   *
   * @returns {Icontacts[]} An array of contacts that are currently selected (checked).
   */
  getSelectedContacts(): Icontacts[] {
    return this.contacts.contactlist.filter((c) => c.checked);
  }

  /**
   * Retrieves the first five selected contacts for display purposes.
   *
   * @returns {Icontacts[]} An array of up to five selected contacts.
   */
  getFirstFiveSelectedContacts(): Icontacts[] {
    return this.getSelectedContacts().slice(0, 5);
  }

  /**
   * Calculates the number of additional selected contacts beyond the first five.
   *
   * @returns {number} The number of additional selected contacts (if more than five are selected).
   */
  getAdditionalContactsCount(): number {
    const selectedCount = this.getSelectedContacts().length;
    return selectedCount > 5 ? selectedCount - 5 : 0;
  }

  /**
   * Toggles the checked state of a contact when clicked in the dropdown.
   *
   * @param {string} contactId - The ID of the contact to toggle.
   * @param {MouseEvent} event - The mouse event to stop propagation.
   */
  checkContact(contactId: string, event: MouseEvent) {
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);

    if (contact) {
      contact.checked = !contact.checked;
      this.contacts.contactlist = [...this.contacts.contactlist];
      event.stopPropagation();
    }
  }

  /**
   * Closes the dropdown if a click occurs outside of the dropdown element.
   * Also clears the input value when the dropdown is closed.
   *
   * @param {MouseEvent} event - The mouse event from the click.
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      this.inputValue = '';
    }
  }

  /**
   * Filters contacts based on the input value in the search field.
   * Updates the filteredContacts array and opens the dropdown if there is input.
   *
   * @param {Event} event - The input event from the search field.
   */
  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.toLowerCase();

    if (inputValue) {
      this.filteredContacts = this.contacts.contactlist.filter((contact) =>
        contact.firstname.toLowerCase().startsWith(inputValue),
      );
      this.isDropdownOpen = true;
    } else {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  /**
   * Toggles the visibility of the contacts dropdown and focuses the search input.
   * If the dropdown is opened, the full contact list is shown.
   */
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    setTimeout(() => this.inputSearch?.nativeElement.focus(), 0);
    if (this.isDropdownOpen) {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  /**
   * Toggles the "Urgent" priority state and resets other priority states.
   */
  toggleUrgent() {
    this.isUrgentClicked = !this.isUrgentClicked;
    if (this.isMediumClicked) this.isMediumClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  /**
   * Toggles the "Medium" priority state and resets other priority states.
   */
  toggleMedium() {
    this.isMediumClicked = !this.isMediumClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  /**
   * Toggles the "Low" priority state and resets other priority states.
   */
  toggleLow() {
    this.isLowClicked = !this.isLowClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isMediumClicked) this.isMediumClicked = false;
  }

  /**
   * Starts the editing mode for a specific subtask.
   *
   * @param {number} index - The index of the subtask to edit.
   */
  startEditingSubtask(index: number) {
    this.editingIndex = index;
    this.editedSubtask = this.subtasklist[index];
  }

  /**
   * Saves the edited subtask and exits editing mode.
   * If the edited subtask is empty, it will not be saved.
   *
   * @param {number} index - The index of the subtask being edited.
   */
  saveEditedSubtask(index: number) {
    if (this.editedSubtask.trim()) {
      this.subtasklist[index] = this.editedSubtask;
    }
    this.editingIndex = null;
  }

  /**
   * Sets the hovered subtask index for displaying actions on hover.
   *
   * @param {number | null} index - The index of the subtask being hovered, or null if not hovering.
   */
  onSubtaskHover(index: number | null) {
    this.hoveredSubtaskIndex = index;
  }

  /**
   * Activates the subtask input field by focusing on it.
   */
  activateInput() {
    this.subtaskInputElement.nativeElement.focus();
  }

  /**
   * Sets the subtask input focus state to true when the input gains focus.
   */
  onSubtaskInputFocus() {
    this.subtaskInputFocus = true;
  }

  /**
   * Sets the subtask input focus state to false when the input loses focus.
   */
  onSubtaskInputBlur() {
    this.subtaskInputFocus = false;
  }

  /**
   * Adds a new subtask to the subtask list if the input is not empty.
   * Clears the input field after adding.
   *
   * @param {MouseEvent} [event] - Optional mouse event to prevent default behavior.
   */
  addToSubtasklist(event?: MouseEvent) {
    if (event) event.preventDefault();
    if (this.inputSubtask.trim()) {
      this.subtasklist.push(this.inputSubtask.trim());
      this.inputSubtask = '';
    }
  }

  /**
   * Handles the keydown event on the subtask input field.
   * Adds the subtask to the list if the "Enter" key is pressed.
   *
   * @param {KeyboardEvent} event - The keyboard event from the input field.
   */
  onSubtaskInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addToSubtasklist();
    }
  }

  /**
   * Clears the subtask input field.
   *
   * @param {MouseEvent} event - The mouse event to prevent default behavior.
   */
  clearSubtaskInput(event: MouseEvent) {
    event.preventDefault();
    this.inputSubtask = '';
  }

  /**
   * Deletes a subtask from the subtask list.
   *
   * @param {number} index - The index of the subtask to delete.
   */
  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
  }

  /**
   * Submits the task form if it is valid.
   * If the form is invalid, it marks all fields as touched and toggles required info visibility.
   */
  onSubmit() {
    this.taskForm.markAllAsTouched();

    if (this.taskForm.valid) {
      const newTask = this.createNewTask();
      this.addTaskAndNavigate(newTask);
    } else {
      this.toggleRequiredInfo();
    }
  }

  /**
   * Creates a new task object from the form values and selected contacts.
   *
   * @returns {Itasks} The newly created task object.
   */
  createNewTask(): Itasks {
    const formValues = this.taskForm.value;
    const selectedContacts = this.getSelectedContacts();
    const prio = this.getPriority();
    const dueDate = this.getDueDate();

    return {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category as 'Technical Task' | 'User Story',
      dueDate: dueDate,
      prio: prio,
      assigned: selectedContacts,
      subtask: this.subtasklist,
      status: 'todo',
    };
  }

  /**
   * Determines the selected priority based on the clicked state.
   *
   * @returns {'Urgent' | 'Medium' | 'Low'} The selected priority.
   */
  getPriority(): 'Urgent' | 'Medium' | 'Low' {
    if (this.isUrgentClicked) return 'Urgent';
    if (this.isLowClicked) return 'Low';
    return 'Medium';
  }

  /**
   * Retrieves the formatted due date from the date FormControl.
   *
   * @returns {string} The due date in a locale string format, or an empty string if not set.
   */
  getDueDate(): string {
    return this.date.value ? this.date.value.toLocaleDateString() : '';
  }

  /**
   * Adds a new task to the task service and navigates to the board after success.
   *
   * @param {Itasks} newTask - The task to add.
   */
  addTaskAndNavigate(newTask: Itasks) {
    this.tasksService
      .addTask(newTask)
      .then(() => {
        this.handleTaskAdded();
      })
      .catch((error) => {
        console.error('Fehler beim Hinzufügen des Tasks:', error);
      });
  }

  /**
   * Handles the successful addition of a task.
   * Emits the taskAdded event, clears the form, shows a confirmation, and navigates to the board.
   */
  handleTaskAdded() {
    this.taskAdded.emit();
    this.onClear();
    this.newTaskAdded = true;
    this.startFadeOut();
    this.navigateToBoard();
  }

  /**
   * Starts the fade-out animation for the task added confirmation message.
   * Sets a timeout to trigger the fade-out effect after 1.5 seconds.
   */
  startFadeOut() {
    setTimeout(() => {
      this.isFadingOut = true;
    }, 1500);
  }

  /**
   * Navigates to the board route after a delay.
   * Resets the task added confirmation state after navigation.
   */
  navigateToBoard() {
    setTimeout(() => {
      this.newTaskAdded = false;
      this.isFadingOut = false;
      this.router.navigate(['/board']);
    }, 2000);
  }

  /**
   * Toggles the visibility of the required info message.
   */
  toggleRequiredInfo() {
    this.requiredInfo = !this.requiredInfo;
  }

  /**
   * Clears the task form and resets all related states to their initial values.
   */
  onClear() {
    const today = new Date().toISOString().split('T')[0];
    this.taskForm.reset({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: today,
      category: '',
    });
    this.contacts.contactlist.forEach((contact) => (contact.checked = false));
    this.filteredContacts = [...this.contacts.contactlist];
    this.selectedContactIds = [];
    this.isDropdownOpen = false;
    this.searchQuery = '';
    this.subtasklist = [];
    this.inputSubtask = '';
    this.isUrgentClicked = false;
    this.isMediumClicked = true;
    this.isLowClicked = false;
    this.requiredInfo = false;
  }
}
