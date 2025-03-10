import {
  Component,
  Input,
  inject,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { Icontacts } from '../../interfaces/icontacts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { ContactsService } from '../../firebase-services/contacts.service';

@Component({
  selector: 'app-contactedit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contactedit.component.html',
  styleUrl: './contactedit.component.scss',
})
export class ContacteditComponent {
  /**
   * The currently selected contact to edit.
   */
  @Input() selectedContact: Icontacts | null = null;

  firstname?: string = '';
  lastname?: string = '';
  email?: string = '';
  phonenumber?: string = '';

  public contacts = inject(ContactsService);
  private firestore: Firestore = inject(Firestore);
  updateSuccess: boolean = false;
  showAnimation: boolean = false;

  constructor() {}

  /**
   * Initializes the component and triggers the animation.
   */
  ngOnInit(): void {
    this.showAnimation = true;
  }

  /**
   * Reacts to changes in the `selectedContact` input and updates the form fields.
   * @param {SimpleChanges} changes - The changes detected by Angular.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedContact'] && this.selectedContact) {
      this.firstname = this.selectedContact.firstname;
      this.lastname = this.selectedContact.lastname;
      this.email = this.selectedContact.email;
      this.phonenumber = this.selectedContact.phonenumber;
    }
  }

  /**
   * Validates the first name using a regex pattern.
   * @returns {boolean} - True if the first name is valid, otherwise false.
   */
  isFirstNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return !!this.firstname && nameRegex.test(this.firstname.trim());
  }

  /**
   * Validates the last name using a regex pattern.
   * @returns {boolean} - True if the last name is valid, otherwise false.
   */
  isLastNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return !!this.lastname && nameRegex.test(this.lastname.trim());
  }

  /**
   * Validates the email address using a regex pattern.
   * @returns {boolean} - True if the email is valid, otherwise false.
   */
  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !!this.email && emailRegex.test(this.email.trim());
  }

  /**
   * Validates the phone number using a regex pattern.
   * @returns {boolean} - True if the phone number is valid, otherwise false.
   */
  isPhoneNumberValid(): boolean {
    const phoneInput = this.phonenumber?.trim() || '';
    return /^\+49\s?\d+$/.test(phoneInput);
  }

  /**
   * Checks if the entire form is valid.
   * @returns {boolean} - True if all form fields are valid, otherwise false.
   */
  isFormValid(): boolean {
    return (
      this.isFirstNameValid() &&
      this.isLastNameValid() &&
      this.isEmailValid() &&
      this.isPhoneNumberValid()
    );
  }

  /**
   * Clears all input fields in the form.
   */
  clearInputs() {
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.phonenumber = '';
  }

  /**
   * Updates the contact in Firestore if the form is valid.
   */
  async updateInFirestore() {
    if (!this.isFormValid() || !this.selectedContact?.id) {
      console.error('No selected contact or form is invalid');
      return;
    }
    await this.performUpdate();
    this.handleUpdateSuccess();
  }

  /**
   * Performs the Firestore update operation.
   */
  private async performUpdate() {
    if (!this.selectedContact?.id) return; // Sicherstellen, dass id existiert
    try {
      const contactRef = doc(
        this.firestore,
        'contacts',
        this.selectedContact.id,
      );
      await updateDoc(contactRef, {
        email: this.email,
        firstname: this.firstname,
        lastname: this.lastname,
        phonenumber: this.phonenumber,
      });
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  }

  /**
   * Handles the success feedback and dialog toggle.
   */
  private handleUpdateSuccess() {
    this.updateSuccess = true;
    setTimeout(() => {
      this.updateSuccess = false;
      this.contacts.toggleDialogEdit();
    }, 2000);
  }
}
