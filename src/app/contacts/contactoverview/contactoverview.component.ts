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

  triggerAnimation() {
    this.showAnimation = false;
    setTimeout(() => {
      this.showAnimation = true;
    });
  }

  async deleteContact() {
    try {
      this.idToDelete = this.contacts.selectedContactId$.value || '';
      await deleteDoc(doc(this.firestore, 'contacts', this.idToDelete));
      this.selectedContact = null;
    } catch (error) {
      console.error('Fehler beim Löschen des Dokuments: ', error);
    }
  }

  toggleEditDelete() {
    this.showEditDelete = !this.showEditDelete;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    if (window.innerWidth > 600) {
      this.showEditDelete = false; 
    }
  }

  backToContacts() {
    this.contacts.showOverview = false;
    this.showEditDelete = false;
  }
}
