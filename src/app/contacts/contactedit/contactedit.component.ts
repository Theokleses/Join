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
import { doc, updateDoc, collection, getFirestore } from 'firebase/firestore';
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

  // firstname: string = '';
  // lastname: string = '';
  // email: string = '';
  // phonenumber: string = '';
  firstname?: string = '';
  lastname?: string = '';
  email?: string = '';
  phonenumber?: string = '';

  public contacts = inject(ContactsService);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedContact'] && this.selectedContact) {
      this.firstname = this.selectedContact.firstname;
      this.lastname = this.selectedContact.lastname;
      this.email = this.selectedContact.email;
      this.phonenumber = this.selectedContact.phonenumber;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.email?.match(emailRegex)
        ? console.log('Correct')
        : console.log('False');
    }
  }

  isFormValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return (
      this.firstname?.trim() !== '' &&
      this.lastname?.trim() !== '' &&
      this.email?.trim() !== '' &&
      this.email?.match(emailRegex) !== null &&
      this.phonenumber?.trim() !== ''
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
          this.contacts.firestore,
          'contacts',
          this.selectedContact.id,
        );
        await updateDoc(contactRef, {
          email: this.email,
          firstname: this.firstname,
          lastname: this.lastname,
          phonenumber: this.phonenumber,
        });
        console.log('Contact updated successfully');
      } catch (error) {
        console.error('Error updating contact:', error);
      }
    } else {
      console.error('No selected contact or form is invalid');
    }
  }
}
