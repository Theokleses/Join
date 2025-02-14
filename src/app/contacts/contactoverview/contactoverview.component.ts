import { Component, inject } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
import { Icontacts } from '../../interfaces/icontacts';
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
  selectedContact: Icontacts | null = null;
  idToDelete: string = '';

  constructor() {
    this.contacts;
  }

  ngOnInit(): void {
    this.contacts.selectedContactId$.subscribe((id) => {
      if (id) {
        this.selectedContact =
          this.contacts.contactlist.find((contact) => contact.id === id) ||
          null;
      } else {
        this.selectedContact = null;
      }
    });
  }

  async editContact() {}

  async deleteContact() {
    this.idToDelete = this.contacts.selectedContactId$.value || '';
    alert(this.idToDelete);
  }
}
