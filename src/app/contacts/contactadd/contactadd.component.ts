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

  /**
   * Adds a new contact if the form data is valid.
   */
  addNewContact() {
    if (this.isNewContactValid()) {
      this.handleContactAddition();
    }
  }

  /**
   * Checks if the new contact has all required fields filled.
   * @returns {boolean} True if all required fields are non-empty, false otherwise.
   */
  private isNewContactValid(): boolean {
    return !!(
      this.newContact.firstname &&
      this.newContact.lastname &&
      this.newContact.email &&
      this.newContact.phonenumber
    );
  }

  /**
   * Handles the addition of a new contact, clears the form, and manages success feedback.
   */
  private handleContactAddition() {
    this.contactsService.addContact(this.newContact);
    this.clearForm();
    this.addSuccess = true;
  
    setTimeout(() => {
      this.addSuccess = false;
      this.contactsService.isAdding = false; // Direkte Zuweisung
    }, 2000);
  }

  /**
   * Toggles the editing dialog state.
   */
  handleDialogToggle() {
    if (this.isEditing) {
      this.toggleDialogEdit();
    } else if (this.isAdding) {
      this.toggleDialogAdd();
    }
  }

  /**
   * Toggles the editing dialog state.
   */
  toggleDialogEdit() {
    this.isEditing = !this.isEditing;
  }

  /**
   * Toggles the adding dialog state.
   */
  toggleDialogAdd() {
    this.isAdding = !this.isAdding;
  }

  /**
   * Resets the form fields to their initial empty state.
   */
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

  /**
   * Validates the first name against a regex pattern.
   * @returns {boolean} True if the first name is valid, false otherwise.
   */
  isFirstNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return nameRegex.test(this.newContact.firstname.trim());
  }

  /**
   * Validates the last name against a regex pattern.
   * @returns {boolean} True if the last name is valid, false otherwise.
   */
  isLastNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return nameRegex.test(this.newContact.lastname.trim());
  }

  /**
   * Validates the email address against a regex pattern.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.newContact.email.trim());
  }

  /**
   * Validates the phone number against a regex pattern.
   * @returns {boolean} True if the phone number is valid, false otherwise.
   */
  isPhoneNumberValid(): boolean {
    const phoneInput = this.newContact.phonenumber?.trim() || '';
    return /^\s?\d+$/.test(phoneInput);
  }

  /**
   * Checks if the entire form is valid based on individual field validations.
   * @returns {boolean} True if all fields are valid, false otherwise.
   */
  isFormValid(): boolean {
    return (
      this.isFirstNameValid() &&
      this.isLastNameValid() &&
      this.isEmailValid() &&
      this.isPhoneNumberValid()
    );
  }
}
