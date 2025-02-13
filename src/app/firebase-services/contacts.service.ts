import { Injectable, OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Icontacts } from '../interfaces/icontacts';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  unsubscribe: () => void;

  contactlist: Icontacts[] = [];
  // selectedContactId?: string = '';
  selectedContactId$ = new BehaviorSubject<string | undefined>(undefined); // BehaviorSubject für selectedContactId

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'contacts'),
      (contacts) => {
        this.contactlist = [];
        contacts.forEach((contact) => {
          this.contactlist.push(
            this.setContactObject(contact.id, contact.data()),
          );
        });
        this.contactlist.sort((a, b) => a.firstname.localeCompare(b.firstname));
      },
    );
  }

  setContactObject(id: string, obj: any): Icontacts {
    return {
      id: id,
      email: obj.email,
      firstname: obj.firstname,
      lastname: obj.lastname,
      phonenumber: obj.phonenumber,
      status: obj.status,
    };
  }

  // setSelectedContactId(id?: string) {
  //   this.selectedContactId = id;
  // }

  setSelectedContactId(id?: string) {
    this.selectedContactId$.next(id); // Wert des BehaviorSubject aktualisieren
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
