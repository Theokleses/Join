import { Component, inject, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
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
  public contacts = inject(ContactsService);
  taskForm: FormGroup;
  isDropdownOpen: boolean = false;
  selectedContactIds: string[] = [];
  searchQuery: string = '';
  filteredContacts: any[] = [];
  isUrgentClicked: boolean = false;
  isMediumClicked: boolean = false;
  isLowClicked: boolean = false;

  constructor(private fb: FormBuilder) {
    this.contacts;
    // Formular initialisieren
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[], Validators.required],
      dueDate: ['', Validators.required],
      category: ['', Validators.required],
    });
    // Initialisiere gefilterte Kontakte mit allen Kontakten
    this.filteredContacts = this.contacts.contactlist;
  }

  checkContact(contactId: string, event: MouseEvent) {
    console.log(contactId);
    const contact = this.contacts.contactlist.find((c) => c.id === contactId);

    if (contact) {
      // Toggle den Checkbox-Zustand
      contact.checked = !contact.checked;
      this.contacts.contactlist = [...this.contacts.contactlist];
      // Verhindere, dass das Event weiter propagiert wird (optional)
      event.stopPropagation();
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const dropdown = document.querySelector('.dropdown');
    const input = document.querySelector('.dropdown-toggle');

    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  onInputChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (inputValue) {
      if (!this.isDropdownOpen) {
        this.isDropdownOpen = true;
      }
      console.log(`Du hast eingegeben: ${inputValue}`);
    } else {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
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

  // Methode zum Absenden des Formulars
  onSubmit() {
    if (this.taskForm.valid) {
      console.log('Formular-Daten:', this.taskForm.value);
      // Hier können Sie die Daten weiterverarbeiten, z.B. an einen Service senden
    } else {
      console.log('Formular ist ungültig');
    }
  }

  // Methode zum Zurücksetzen des Formulars
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
