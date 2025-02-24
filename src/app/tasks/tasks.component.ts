import {
  Component,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
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

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  @ViewChild('inputSearch') inputSearch!: ElementRef;
  public contacts = inject(ContactsService);
  taskForm: FormGroup;
  isDropdownOpen: boolean = false;
  selectedContactIds: string[] = [];
  searchQuery: string = '';
  filteredContacts: any[] = [];
  isUrgentClicked: boolean = false;
  isMediumClicked: boolean = false;
  isLowClicked: boolean = false;
  inputValue: string = '';

  constructor(private fb: FormBuilder) {
    this.contacts;
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[], Validators.required],
      dueDate: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.filteredContacts = this.contacts.contactlist;
  }

  checkContact(contactId: string, event: MouseEvent) {
    console.log(contactId);
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
      this.inputValue = ''; // Leert das Eingabefeld
      console.log('Dropdown geschlossen, inputValue geleert'); // Debugging
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
    if (this.isMediumClicked) {
      this.isMediumClicked = false;
    }
    if (this.isLowClicked) {
      this.isLowClicked = false;
    }
  }

  toggleMedium() {
    this.isMediumClicked = !this.isMediumClicked;
    if (this.isUrgentClicked) {
      this.isUrgentClicked = false;
    }
    if (this.isLowClicked) {
      this.isLowClicked = false;
    }
  }

  toggleLow() {
    this.isLowClicked = !this.isLowClicked;
    if (this.isUrgentClicked) {
      this.isUrgentClicked = false;
    }
    if (this.isMediumClicked) {
      this.isMediumClicked = false;
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      console.log('Formular-Daten:', this.taskForm.value);
    } else {
      console.log('Formular ist ungültig');
    }
  }

  onClear() {
    this.taskForm.reset({
      title: '',
      description: '',
      assignedTo: [],
      dueDate: '',
      category: '',
    });
    this.selectedContactIds = [];
    this.isDropdownOpen = false;
    this.searchQuery = '';
  }
}
