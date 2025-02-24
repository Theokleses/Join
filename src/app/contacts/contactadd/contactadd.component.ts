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
    checked: false,
  };

  constructor(public contactsService: ContactsService) {}

  isEditing: boolean = false;
  isAdding: boolean = false;
  showOverview: boolean = false;
  showAnimation: boolean = false;
  addSuccess: boolean = false;

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
      this.addSuccess = true;

      setTimeout(() => {
        this.addSuccess = false;
        this.toggleDialogAdd();
      }, 2000);
    }
  }

  handleDialogToggle() {
    if (this.isEditing) {
      this.toggleDialogEdit();
    } else if (this.isAdding) {
      this.toggleDialogAdd();
    }
  }

  toggleDialogEdit() {
    this.isEditing = !this.isEditing;
  }

  toggleDialogAdd() {
    this.isAdding = !this.isAdding;
  }

  clearForm() {
    this.newContact = {
      firstname: '',
      lastname: '',
      email: '',
      phonenumber: '',
      status: '',
      checked: false,
    };
  }

 // Validierung für Vorname
  isFirstNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/; // Nur Buchstaben und Leerzeichen erlaubt
    return nameRegex.test(this.newContact.firstname.trim());
  }

  // Validierung für Nachname
  isLastNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/; // Nur Buchstaben und Leerzeichen erlaubt
    return nameRegex.test(this.newContact.lastname.trim());
  }

  // Validierung für E-Mail
  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.newContact.email.trim());
  }

  // Validierung für Telefonnummer (bereits vorhanden)
  isPhoneNumberValid(): boolean {
    const phoneInput = this.newContact.phonenumber?.trim() || '';
    return /^\+49\s?\d+$/.test(phoneInput);
  }

  // Gesamtvalidierung für das Formular
  isFormValid(): boolean {
    return (
      this.isFirstNameValid() &&
      this.isLastNameValid() &&
      this.isEmailValid() &&
      this.isPhoneNumberValid()
    );
  }
}
