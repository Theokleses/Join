import { Component, inject } from '@angular/core';
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
  constructor() {
    this.contacts;
  }
}
