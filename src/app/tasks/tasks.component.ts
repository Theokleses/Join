import { Component, inject } from '@angular/core';
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

  constructor(private fb: FormBuilder) {
    this.contacts;
    // Formular initialisieren
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      assignedTo: [[], Validators.required],
    });
    // Initialisiere gefilterte Kontakte mit allen Kontakten
    this.filteredContacts = this.contacts.contactlist;
  }

  // // Dropdown-Menü ein-/ausblenden
  // toggleDropdown() {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  //   if (this.isDropdownOpen) {
  //     this.filterContacts(); // Beim Öffnen des Dropdowns Kontakte filtern
  //   }
  // }

  // Dropdown-Menü öffnen
  openDropdown() {
    this.isDropdownOpen = true;
    this.filterContacts(); // Beim Öffnen alle Kontakte anzeigen
  }

  // Dropdown-Menü schließen (mit Verzögerung)
  onInputBlur() {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200); // Verzögerung, um Klicks auf Kontakte zu verarbeiten
  }

  // Verhindert, dass das Dropdown-Menü beim Klicken auf Kontakte geschlossen wird
  preventBlur() {
    this.isDropdownOpen = true;
  }

  // Dropdown-Menü schließen
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Kontakte basierend auf dem Suchbegriff filtern
  filterContacts() {
    if (!this.searchQuery) {
      this.filteredContacts = this.contacts.contactlist; // Zeige alle Kontakte an, wenn kein Suchbegriff eingegeben wurde
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredContacts = this.contacts.contactlist.filter(
        (contact) =>
          contact.firstname.toLowerCase().startsWith(query) ||
          contact.lastname.toLowerCase().startsWith(query),
      );
    }
  }

  // Überprüfen, ob ein Kontakt ausgewählt ist
  isContactSelected(contactId: string | undefined): boolean {
    if (!contactId) {
      return false;
    }
    return this.selectedContactIds.includes(contactId);
  }

  // Kontakt auswählen/abwählen
  toggleContactSelection(contactId: string | undefined) {
    if (!contactId) {
      return;
    }
    if (this.isContactSelected(contactId)) {
      this.selectedContactIds = this.selectedContactIds.filter(
        (id) => id !== contactId,
      );
    } else {
      this.selectedContactIds.push(contactId);
    }
    this.taskForm.get('assignedTo')?.setValue(this.selectedContactIds);
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
    this.taskForm.reset();
    this.selectedContactIds = [];
    this.isDropdownOpen = false;
    this.searchQuery = '';
    this.filterContacts();
  }
}
