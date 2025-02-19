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

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedContact'] && this.selectedContact) {
      this.firstname = this.selectedContact.firstname;
      this.lastname = this.selectedContact.lastname;
      this.email = this.selectedContact.email;
      this.phonenumber = this.selectedContact.phonenumber;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.email?.match(emailRegex) ? console.log() : console.log();
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
