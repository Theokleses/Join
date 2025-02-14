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
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
