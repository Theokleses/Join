import { Component, inject } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
<<<<<<< HEAD
=======
import { Icontacts } from '../../interfaces/icontacts';
>>>>>>> 206cfc56077705ac650a5b33a65a225d14507a04
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactoverview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contactoverview.component.html',
  styleUrl: './contactoverview.component.scss',
})
export class ContactoverviewComponent {
  public contacts = inject(ContactsService);
<<<<<<< HEAD
  constructor() {
    this.contacts;
  }
  
=======
  selectedContact: Icontacts | null = null; // Variable für den ausgewählten Kontakt
  constructor() {
    this.contacts;
  }
  ngOnInit(): void {
    // Abonniere das selectedContactId$-Observable
    this.contacts.selectedContactId$.subscribe((id) => {
      if (id) {
        // Finde den Kontakt in der contactlist anhand der ID
        this.selectedContact =
          this.contacts.contactlist.find((contact) => contact.id === id) ||
          null;
      } else {
        this.selectedContact = null; // Setze selectedContact auf null, wenn keine ID vorhanden ist
      }
    });
  }
>>>>>>> 206cfc56077705ac650a5b33a65a225d14507a04
}
