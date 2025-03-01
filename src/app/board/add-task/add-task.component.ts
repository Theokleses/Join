import { Component, inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
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
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent {
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  @ViewChild('subtaskInputElement') subtaskInputElement!: ElementRef;
  isOpen: boolean = false;
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

  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = new Date(inputElement.value);
    this.date.setValue(selectedDate);
  }

  checkContact(contactId: string, event: MouseEvent) {
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);

    if (contact) {
      contact.checked = !contact.checked;
      this.contacts.contactlist = [...this.contacts.contactlist];
      event.stopPropagation();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      this.inputValue = '';
    }
  }

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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    setTimeout(() => this.inputSearch?.nativeElement.focus(), 0);
    if (this.isDropdownOpen) {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  toggleUrgent() {
    this.isUrgentClicked = !this.isUrgentClicked;
    if (this.isMediumClicked) this.isMediumClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  toggleMedium() {
    this.isMediumClicked = !this.isMediumClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isLowClicked) this.isLowClicked = false;
  }

  toggleLow() {
    this.isLowClicked = !this.isLowClicked;
    if (this.isUrgentClicked) this.isUrgentClicked = false;
    if (this.isMediumClicked) this.isMediumClicked = false;
  }

  startEditingSubtask(index: number) {
    this.editingIndex = index;
    this.editedSubtask = this.subtasklist[index];
  }

  saveEditedSubtask(index: number) {
    if (this.editedSubtask.trim()) {
      this.subtasklist[index] = this.editedSubtask;
    }
    this.editingIndex = null;
  }

  onSubtaskHover(index: number | null) {
    this.hoveredSubtaskIndex = index;
  }

  activateInput() {
    this.subtaskInputElement.nativeElement.focus();
  }

  onSubtaskInputFocus() {
    this.subtaskInputFocus = true;
  }

  onSubtaskInputBlur() {
    this.subtaskInputFocus = false;
  }

  addToSubtasklist(event?: MouseEvent) {
    if (event) event.preventDefault();
    if (this.inputSubtask.trim()) {
      this.subtasklist.push(this.inputSubtask.trim());
      this.inputSubtask = '';
    }
  }

  onSubtaskInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addToSubtasklist();
    }
  }

  clearSubtaskInput(event: MouseEvent) {
    event.preventDefault();
    this.inputSubtask = '';
  }

  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
  }

  onSubmit() {
    this.taskForm.markAllAsTouched();

    if (this.taskForm.valid) {
      const formValues = this.taskForm.value;

      const selectedContacts: Icontacts[] = this.contacts.contactlist.filter(
        (contact) => contact.checked,
      );

      let prio: 'Urgent' | 'Medium' | 'Low' = 'Medium';
      if (this.isUrgentClicked) prio = 'Urgent';
      else if (this.isMediumClicked) prio = 'Medium';
      else if (this.isLowClicked) prio = 'Low';

      const dueDate = this.date.value
        ? this.date.value.toLocaleDateString()
        : '';

      const newTask: Itasks = {
        title: formValues.title,
        description: formValues.description,
        category: formValues.category as 'Technical Task' | 'User Story',
        dueDate: dueDate,
        prio: prio,
        assigned: selectedContacts,
        subtask: this.subtasklist,
        status: 'todo',
      };

      this.tasksService.addTask(newTask).then(() => {
        this.newTaskAdded = true;
        setTimeout(() => {
          this.isFadingOut = true;
        }, 1500);
        setTimeout(() => {
          this.newTaskAdded = false;
          this.isFadingOut = false;
          this.closeOverlay(); // Overlay schließen nach erfolgreichem Hinzufügen
        }, 2000);
        this.onClear();
      }).catch(error => {
        console.error('Fehler beim Hinzufügen des Tasks:', error);
      });
    } else {
      this.requiredInfo = !this.requiredInfo;
    }
  }

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

  closeOverlay() {
    this.isOpen = false;
  }
}