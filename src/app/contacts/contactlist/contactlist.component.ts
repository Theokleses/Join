import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../firebase-services/contacts.service';

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent {
  public contacts = inject(ContactsService);

  constructor() {
    this.contacts;
  }
}
