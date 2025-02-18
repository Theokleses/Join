import { Component, OnInit } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
import { Icontacts } from '../../interfaces/icontacts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactadd',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  showAnimation: boolean = false;

  ngOnInit(): void {
    this.showAnimation = true;
  }

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
