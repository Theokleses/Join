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
  contactlist: Icontacts[] = [];
  selectedContactId$ = new BehaviorSubject<string | undefined>(undefined);
  showOverview: boolean = true;

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

  setContactObject(id: string, obj: any, index: number): Icontacts {
    return {
      id: id,
      email: obj.email,
      firstname: obj.firstname,
      lastname: obj.lastname,
      phonenumber: obj.phonenumber,
      status: obj.status,
      initialBg: this.getColor(index),
    };
  }

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

  setSelectedContactId(id?: string) {
    this.selectedContactId$.next(id);
    this.toggleOverview();
  }

  async addContact(contacts: Omit<Icontacts, 'id' | 'initialBg'>) {
    try {
      await addDoc(collection(this.firestore, 'contacts'), contacts);
      console.log('Kontakt erfolgreich hinzugefügt');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Kontakts:', error);
    }
  }

  toggleOverview() {
    if (window.innerWidth <= 600) {
      this.showOverview = !this.showOverview;
    }
  }

  toggleDialogEdit() {
    this.isEditing = !this.isEditing;
  }

  toggleDialogAdd() {
    this.isAdding = !this.isAdding;
  }

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

  handleDialogToggle() {
    if (this.isEditing) {
      this.toggleDialogEdit();
    } else if (this.isAdding) {
      this.toggleDialogAdd();
    }
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

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
