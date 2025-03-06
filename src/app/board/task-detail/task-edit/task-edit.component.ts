import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Itasks } from '../../../interfaces/itasks';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { inject } from '@angular/core';
import { TasksService } from '../../../firebase-services/tasks.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { Icontacts } from '../../../interfaces/icontacts';
import { ContactsService } from '../../../firebase-services/contacts.service';
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
  private contactsService = inject(ContactsService);

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
  hoveredIndex: number | null = null;
  showAnimation: boolean = false;
  editingSubtaskIndex: number | null = null;
  editedSubtaskText: string = '';

  ngOnInit() {
    this.initializeContacts();
    this.initializeTaskForm();
    this.initializeSubtasks();
    this.markAssignedContacts();
    this.setPriorityButtons();
  }

  private initializeContacts() {
    this.contacts.contactlist = [...this.contactsService.contactlist];
    this.filteredContacts = [...this.contacts.contactlist];
    this.showAnimation = true;
  }

  private initializeTaskForm() {
    const today = new Date().toISOString().split('T')[0];
    this.taskForm = this.fb.group(this.setTaskForm(today));
  }

  private setTaskForm(defaultDate: string) {
    return {
      title: [this.task?.title || '', Validators.required],
      description: [this.task?.description || ''],
      dueDate: [this.task?.dueDate || defaultDate, Validators.required],
      category: [this.task?.category || '', Validators.required],
      prio: [this.task?.prio || 'Medium'],
      assigned: [this.task?.assigned || []],
      subtask: [this.task?.subtask || []],
    };
  }

  private initializeSubtasks() {
    this.subtasklist = this.task?.subtask ? [...this.task.subtask] : [];
  }

  markAssignedContacts() {
    if (this.task?.assigned && this.contacts.contactlist.length > 0) {
      this.contacts.contactlist.forEach((contact) => {
        contact.checked = this.task!.assigned!.some((a) => a.id === contact.id);
      });
    }
  }

  setPriorityButtons() {
    switch (this.task?.prio) {
      case 'Urgent':
        this.checkCaseUrgent();
        break;
      case 'Medium':
        this.checkCaseMedium();
        break;
      case 'Low':
        this.checkCaseLow();
        break;
      default:
        this.setDefaultPriority();
    }
  }

  private checkCaseUrgent() {
    this.isUrgentClicked = true;
    this.isMediumClicked = false;
    this.isLowClicked = false;
  }

  private checkCaseMedium() {
    this.isUrgentClicked = false;
    this.isMediumClicked = true;
    this.isLowClicked = false;
  }

  private checkCaseLow() {
    this.isUrgentClicked = false;
    this.isMediumClicked = false;
    this.isLowClicked = true;
  }

  private setDefaultPriority() {
    this.isUrgentClicked = false;
    this.isMediumClicked = true; // Medium als Standard
    this.isLowClicked = false;
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
      this.filteredContacts = [...this.contacts.contactlist];
    }
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value.toLowerCase();
    this.filteredContacts = this.contacts.contactlist.filter((contact) =>
      `${contact.firstname} ${contact.lastname}`
        .toLowerCase()
        .includes(inputValue)
    );
    this.isDropdownOpen = !!inputValue;
  }

  checkContact(contactId: string, event: MouseEvent) {
    event.stopPropagation();
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);
    if (contact) {
      contact.checked = !contact.checked;
      this.taskForm.patchValue({
        assigned: this.contacts.contactlist.filter((c) => c.checked),
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
    if (
      this.inputSubtask.trim() &&
      !this.subtasklist.includes(this.inputSubtask.trim())
    ) {
      this.subtasklist.push(this.inputSubtask.trim());
      this.inputSubtask = '';
      this.taskForm.get('subtask')?.setValue([...this.subtasklist]);
    }
  }

  deleteFromSubtasklist(index: number) {
    this.subtasklist.splice(index, 1);
    this.taskForm.get('subtask')?.setValue([...this.subtasklist]);
  }

  startSubtaskEdit(index: number) {
    this.editingSubtaskIndex = index;
    this.editedSubtaskText = this.subtasklist[index];
  }

  saveSubtaskEdit(index: number) {
    if (
      this.editedSubtaskText.trim() &&
      this.editedSubtaskText !== this.subtasklist[index]
    ) {
      this.subtasklist[index] = this.editedSubtaskText.trim();
      this.taskForm.get('subtask')?.setValue([...this.subtasklist]);
    }
    this.editingSubtaskIndex = null;
    this.editedSubtaskText = '';
  }

  onDateChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = inputElement.value;
    this.taskForm.get('dueDate')?.setValue(selectedDate);
  }

  showIcons(index: number) {
    this.hoveredIndex = index;
  }

  hideIcons(index: number) {
    if (this.hoveredIndex === index) {
      this.hoveredIndex = null;
    }
  }

  async saveEditedTask() {
    this.checkFormValid();

    const updatedTask = this.prepareUpdatedTask();
    await this.updateTaskInFirestore(updatedTask);
  }

  private prepareUpdatedTask(): Itasks {
    return {
      ...this.task,
      ...this.taskForm.value,
      assigned: this.taskForm.get('assigned')?.value,
      subtask: this.taskForm.get('subtask')?.value,
      id: this.task?.id,
    };
  }

  private async updateTaskInFirestore(updatedTask: Itasks) {
    try {
      const taskDocRef = this.getTaskDocRef(updatedTask.id!);
      const updateData = this.extractUpdateData(updatedTask);
      await updateDoc(taskDocRef, updateData);
      this.handleUpdateSuccess(updatedTask);
    } catch (error) {
      this.handleUpdateError(error);
    }
  }

  private getTaskDocRef(taskId: string) {
    return doc(this.firestore, 'tasks', taskId);
  }

  private extractUpdateData(updatedTask: Itasks) {
    return {
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.dueDate,
      category: updatedTask.category,
      prio: updatedTask.prio,
      assigned: updatedTask.assigned,
      subtask: updatedTask.subtask,
    };
  }

  private handleUpdateSuccess(updatedTask: Itasks) {
    this.editError = null;
    this.editComplete.emit(updatedTask);
  }

  private handleUpdateError(error: any) {
    this.editError =
      'Fehler beim Bearbeiten des Tasks. Bitte versuche es erneut.';
    console.error('Update error:', error); // Optional für Debugging
  }

  checkFormValid() {
    if (this.taskForm.invalid) {
      this.editError = 'Bitte füllen Sie alle Pflichtfelder aus.';
      return;
    }
  }

  cancelEdit() {
    this.editComplete.emit(null);
  }
}
