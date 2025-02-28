import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Itasks } from '../../../interfaces/itasks';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { TasksService } from '../../../firebase-services/tasks.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Icontacts } from '../../../interfaces/icontacts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './task-edit.component.html',
  styleUrl: './task-edit.component.scss',
})
export class TaskEditComponent implements OnInit {
  @Input() task: Itasks | null = null;
  @Output() editComplete = new EventEmitter<Itasks | null>();
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  public tasks = inject(TasksService);
  public firestore: Firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  taskForm: FormGroup = new FormGroup({});
  editError: string | null = null;
  isDropdownOpen: boolean = false;
  inputValue: string = '';
  inputSubtask: string = '';
  subtasklist: string[] = [];
  isUrgentClicked: boolean = false;
  isMediumClicked: boolean = false;
  isLowClicked: boolean = false;
  contacts: { contactlist: Icontacts[] } = { contactlist: [] };
  filteredContacts: Icontacts[] = [];
  hoveredIndex: number | null = null; // Neue Eigenschaft für Hover-Tracking

  ngOnInit() {
    this.contacts.contactlist = this.getContactsFromTask();
    this.filteredContacts = [...this.contacts.contactlist];

    const today = new Date().toISOString().split('T')[0];
    this.taskForm = this.fb.group({
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      dueDate: [this.task?.dueDate || today, Validators.required],
      category: [this.task?.category || '', Validators.required],
      prio: [this.task?.prio || 'Medium'],
      assigned: [this.task?.assigned || []],
      subtask: [this.task?.subtask || []],
    });

    this.setPriorityButtons();
    this.subtasklist = this.task?.subtask ? [...this.task.subtask] : [];
  }

  getContactsFromTask(): Icontacts[] {
    return this.task?.assigned?.map(a => ({
      ...a,
      checked: true,
    })) || [];
  }

  setPriorityButtons() {
    switch (this.task?.prio) {
      case 'Urgent':
        this.isUrgentClicked = true;
        this.isMediumClicked = false;
        this.isLowClicked = false;
        break;
      case 'Medium':
        this.isUrgentClicked = false;
        this.isMediumClicked = true;
        this.isLowClicked = false;
        break;
      case 'Low':
        this.isUrgentClicked = false;
        this.isMediumClicked = false;
        this.isLowClicked = true;
        break;
      default:
        this.isUrgentClicked = false;
        this.isMediumClicked = true;
        this.isLowClicked = false;
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

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    setTimeout(() => this.inputSearch?.nativeElement.focus(), 0);
    if (this.isDropdownOpen) {
      this.filteredContacts = this.contacts.contactlist;
    }
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.toLowerCase();
    this.filteredContacts = this.contacts.contactlist.filter(contact =>
      `${contact.firstname} ${contact.lastname}`.toLowerCase().includes(inputValue)
    );
    this.isDropdownOpen = !!inputValue;
  }

  checkContact(contactId: string, event: MouseEvent) {
    event.stopPropagation();
    const contact = this.contacts.contactlist.find(c => c.id === contactId);
    if (contact) {
      contact.checked = !contact.checked;
      this.taskForm.patchValue({
        assigned: this.contacts.contactlist.filter(c => c.checked),
      });
    }
  }

  toggleUrgent() {
    this.isUrgentClicked = true;
    this.isMediumClicked = false;
    this.isLowClicked = false;
    this.taskForm.get('prio')?.setValue('Urgent');
  }

  toggleMedium() {
    this.isUrgentClicked = false;
    this.isMediumClicked = true;
    this.isLowClicked = false;
    this.taskForm.get('prio')?.setValue('Medium');
  }

  toggleLow() {
    this.isUrgentClicked = false;
    this.isMediumClicked = false;
    this.isLowClicked = true;
    this.taskForm.get('prio')?.setValue('Low');
  }

  addToSubtasklist() {
    if (this.inputSubtask.trim() && !this.subtasklist.includes(this.inputSubtask.trim())) {
      this.subtasklist.push(this.inputSubtask.trim());
      this.inputSubtask = '';
      this.taskForm.get('subtask')?.setValue([...this.subtasklist]);
    }
  }

  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
    this.taskForm.get('subtask')?.setValue([...this.subtasklist]);
  }

  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = inputElement.value;
    this.taskForm.get('dueDate')?.setValue(selectedDate);
    console.log('Date changed to:', selectedDate);
  }

  // Neue Methode für Hover-Logik
  showIcons(index: number) {
    this.hoveredIndex = index;
  }

  hideIcons(index: number) {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
  }

  // Neue Methode für Subtask-Bearbeitung (Placeholder, muss implementiert werden)
  editSubtask(index: number) {
    console.log('Edit subtask at index:', index);
    // Hier könntest du eine Bearbeitungslogik implementieren, z. B. ein Eingabefeld öffnen
  }

  async saveEditedTask() {
    if (this.taskForm.invalid) {
      this.editError = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }

    const updatedTask: Itasks = {
      ...this.task,
      ...this.taskForm.value,
      assigned: this.taskForm.get('assigned')?.value,
      subtask: this.taskForm.get('subtask')?.value,
      id: this.task?.id,
    };

    try {
      const taskDocRef = doc(this.firestore, 'tasks', updatedTask.id!);
      const updateData = {
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        category: updatedTask.category,
        prio: updatedTask.prio,
        assigned: updatedTask.assigned,
        subtask: updatedTask.subtask,
      };
      await updateDoc(taskDocRef, updateData);
      console.log('Task successfully updated:', updatedTask.id);
      this.editError = null;
      this.editComplete.emit(updatedTask);
    } catch (error) {
      this.editError = 'Fehler beim Bearbeiten des Tasks. Bitte versuche es erneut.';
      console.error('Error updating document: ', error);
    }
  }

  cancelEdit() {
    this.editComplete.emit(null);
  }
}