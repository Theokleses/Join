import { Component } from '@angular/core';
import { ContactlistComponent } from './contactlist/contactlist.component';
import { ContactoverviewComponent } from './contactoverview/contactoverview.component';
import { ContactaddComponent } from './contactadd/contactadd.component';
import { ContacteditComponent } from './contactedit/contactedit.component'; //Eventuell in die Contactoverview Component hinzufügen

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ContactlistComponent, ContactoverviewComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {}
