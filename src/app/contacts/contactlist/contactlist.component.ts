import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../firebase-services/contacts.service';
import { ContactaddComponent } from "../contactadd/contactadd.component";

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [CommonModule, ContactaddComponent],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent {
  public contacts = inject(ContactsService);

  constructor() {
    this.contacts;
  }
}
