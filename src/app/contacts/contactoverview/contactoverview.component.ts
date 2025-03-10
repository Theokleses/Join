import { Component, inject, HostListener } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
import { Icontacts } from '../../interfaces/icontacts';
import { CommonModule } from '@angular/common';
import { ContacteditComponent } from '../contactedit/contactedit.component';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-contactoverview',
  standalone: true,
  imports: [CommonModule, ContacteditComponent],
  templateUrl: './contactoverview.component.html',
  styleUrl: './contactoverview.component.scss',
})
export class ContactoverviewComponent {
  public contacts = inject(ContactsService);
  firestore: Firestore = inject(Firestore);
  selectedContact: Icontacts | null = null;
  idToDelete: string = '';
  showAnimation: boolean = false;
  showEditDelete: boolean = false;

  constructor() {
    this.contacts;
  }

  /**
   * Initializes the component by subscribing to the selected contact ID and updating the selected contact.
   */
  ngOnInit(): void {
    this.contacts.selectedContactId$.subscribe((id) => {
      if (id) {
        this.selectedContact =
          this.contacts.contactlist.find((contact) => contact.id === id) ||
          null;
        this.triggerAnimation();
      } else {
        this.selectedContact = null;
      }
    });
  }

  /**
   * Triggers a brief animation by toggling the showAnimation flag.
   */
  triggerAnimation() {
    this.showAnimation = false;
    setTimeout(() => {
      this.showAnimation = true;
    });
  }

  /**
   * Deletes the currently selected contact from Firestore.
   */
  async deleteContact() {
    try {
      this.idToDelete = this.contacts.selectedContactId$.value || '';
      await deleteDoc(doc(this.firestore, 'contacts', this.idToDelete));
      this.selectedContact = null;
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  /**
   * Toggles the visibility of the edit/delete options.
   */
  toggleEditDelete() {
    this.showEditDelete = !this.showEditDelete;
  }

  /**
   * Responds to window resize events and adjusts the UI accordingly.
   * @param {any} event - The resize event object.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  /**
   * Checks the screen width and hides edit/delete options on larger screens.
   */
  checkScreenWidth() {
    if (window.innerWidth > 600) {
      this.showEditDelete = false;
    }
  }

  /**
   * Navigates back to the contacts list by hiding the overview.
   */
  backToContacts() {
    this.contacts.showOverview = false;
    this.showEditDelete = false;
  }
}
