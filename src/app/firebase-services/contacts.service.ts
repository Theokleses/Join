import { Injectable, OnDestroy } from '@angular/core';
import { inject } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { Icontacts } from '../interfaces/icontacts';

@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  unsubscribe: () => void;

  contactlist: Icontacts[] = [];

  constructor() {
    this.unsubscribe = onSnapshot(
      collection(this.firestore, 'contacts'),
      (contacts) => {
        this.contactlist = [];
        console.clear();
        contacts.forEach((contact) => {
          console.log(contact.id, contact.data());
          this.contactlist.push(
            this.setContactObject(contact.id, contact.data()),
          );
        });
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

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
