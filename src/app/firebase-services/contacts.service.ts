import { Injectable, OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Icontacts } from '../interfaces/icontacts';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  unsubscribe: () => void;
  isEditing: boolean = false;
  isAdding: boolean = false;
  showOverview: boolean = false;
  showAnimation: boolean = false;
  contactlist: Icontacts[] = [];
  selectedContactId$ = new BehaviorSubject<string | undefined>(undefined);

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'contacts'),
      (contacts) => {
        this.contactlist = [];
        let index = 0;
        contacts.forEach((contact) => {
          this.contactlist.push(
            this.setContactObject(contact.id, contact.data(), index),
          );
          index++;
        });
        this.contactlist.sort((a, b) => a.firstname.localeCompare(b.firstname));
      },
      (error) => {
        console.error('Error fetching contacts:', error);
      },
    );
  }

  /**
   * Creates a contact object with the specified properties and a generated background color.
   * @param {string} id - The unique ID of the contact.
   * @param {any} obj - The raw contact data from Firestore.
   * @param {number} index - The index used to determine the background color.
   * @returns {Icontacts} The constructed contact object.
   */
  setContactObject(id: string, obj: any, index: number): Icontacts {
    return {
      id: id,
      email: obj.email,
      firstname: obj.firstname,
      lastname: obj.lastname,
      phonenumber: obj.phonenumber,
      status: obj.status,
      initialBg: this.getColor(index),
      checked: false,
    };
  }

  /**
   * Returns a color from a predefined list based on the provided index.
   * @param {number} index - The index to select the color.
   * @returns {string} The selected color as a hex code.
   */
  getColor(index: number): string {
    const colors = [
      '#FF7A00',
      '#9327FF',
      '#6E52FF',
      '#FC71FF',
      '#FFBB2B',
      '#1FD7C1',
      '#462F8A',
    ];
    return colors[index % colors.length];
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
   * Sets the selected contact ID and shows the overview.
   * @param {string} [id] - The ID of the contact to select (optional).
   */
  setSelectedContactId(id?: string) {
    this.selectedContactId$.next(id);
    this.showOverview = true;
  }

  /**
   * Adds a new contact to Firestore.
   * @param {Omit<Icontacts, 'id' | 'initialBg'>} contacts - The contact data to add.
   */
  async addContact(contacts: Omit<Icontacts, 'id' | 'initialBg'>) {
    try {
      await addDoc(collection(this.firestore, 'contacts'), contacts);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kontakts:', error);
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
   * Groups contacts by the first letter of their firstname.
   * @returns {{ letter: string; contacts: Icontacts[] }[]} An array of grouped contacts.
   */
  getGroupedContacts(): { letter: string; contacts: Icontacts[] }[] {
    const grouped = new Map<string, Icontacts[]>();

    this.contactlist.forEach((contact) => {
      const letter = contact.firstname.charAt(0).toUpperCase();
      if (!grouped.has(letter)) {
        grouped.set(letter, []);
      }
      grouped.get(letter)!.push(contact);
    });

    return Array.from(grouped, ([letter, contacts]) => ({
      letter,
      contacts,
    })).sort((a, b) => a.letter.localeCompare(b.letter));
  }

  /**
   * Toggles the appropriate dialog based on the current editing or adding state.
   */
  handleDialogToggle() {
    if (this.isEditing) {
      this.toggleDialogEdit();
    } else if (this.isAdding) {
      this.toggleDialogAdd();
    }
  }

  /**
   * Cleans up the Firestore subscription when the service is destroyed.
   */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Deletes the currently selected contact from Firestore.
   */
  async deleteContact() {
    const selectedContactId = this.selectedContactId$.value;
    if (!selectedContactId) {
      console.error('Kein Kontakt zum Löschen ausgewählt');
      return;
    }

    try {
      await deleteDoc(doc(this.firestore, 'contacts', selectedContactId));
      this.selectedContactId$.next(undefined);
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }
}
