import { Component } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
import { Icontacts } from '../../interfaces/icontacts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contactadd',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contactadd.component.html',
  styleUrl: './contactadd.component.scss',
})
export class ContactaddComponent {
  newContact: Omit<Icontacts, 'id' | 'initialBg'> = {
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    status: 'active',
  };
  constructor(public contactsService: ContactsService) {}

  addNewContact() {
    if (
      this.newContact.firstname &&
      this.newContact.lastname &&
      this.newContact.email &&
      this.newContact.phonenumber
    ) {
      this.contactsService.addContact(this.newContact);
      this.clearForm();
    } else {
      console.error('Bitte alle Felder ausfüllen!');
    }
  }

  clearForm() {
    this.newContact = {
      firstname: '',
      lastname: '',
      email: '',
      phonenumber: '',
      status: '',
    };
  }
}
