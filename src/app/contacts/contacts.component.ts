import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactlistComponent } from './contactlist/contactlist.component';
import { ContactoverviewComponent } from './contactoverview/contactoverview.component';
import { ContacteditComponent } from './contactedit/contactedit.component'; //Eventuell in die Contactoverview Component hinzufügen
import { ContactsService } from '../firebase-services/contacts.service';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactlistComponent, ContactoverviewComponent, CommonModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {
  public contacts = inject(ContactsService);
  sO = false;
  constructor() {
    this.contacts;

    if (window.innerWidth <= 600) {
      this.contacts.showOverview = false;
    } else {
      this.contacts.showOverview = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth <= 600) {
      this.contacts.showOverview = false;
    } else {
      this.contacts.showOverview = true;
    }
  }
}
