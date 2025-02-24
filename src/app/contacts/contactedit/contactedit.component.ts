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

  ngOnInit(): void {
    this.showAnimation = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedContact'] && this.selectedContact) {
      this.firstname = this.selectedContact.firstname;
      this.lastname = this.selectedContact.lastname;
      this.email = this.selectedContact.email;
      this.phonenumber = this.selectedContact.phonenumber;
    }
  }

  isFirstNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return !!this.firstname && nameRegex.test(this.firstname.trim());
  }

  isLastNameValid(): boolean {
    const nameRegex = /^[a-zA-ZüöäÜÖÄß\s]+$/;
    return !!this.lastname && nameRegex.test(this.lastname.trim());
  }

  isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !!this.email && emailRegex.test(this.email.trim());
  }

  isPhoneNumberValid(): boolean {
    const phoneInput = this.phonenumber?.trim() || '';
    return /^\+49\s?\d+$/.test(phoneInput);
  }

  isFormValid(): boolean {
    return (
      this.isFirstNameValid() &&
      this.isLastNameValid() &&
      this.isEmailValid() &&
      this.isPhoneNumberValid()
    );
  }

  clearInputs() {
    this.firstname = '';
    this.lastname = '';
    this.email = '';
    this.phonenumber = '';
  }

  async updateInFirestore() {
    if (this.selectedContact && this.selectedContact.id && this.isFormValid()) {
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

        this.updateSuccess = true;

        setTimeout(() => {
          this.updateSuccess = false;
          this.contacts.toggleDialogEdit();
        }, 2000);
      } catch (error) {
        console.error('Error updating contact:', error);
      }
    } else {
      console.error('No selected contact or form is invalid');
    }
  }
}