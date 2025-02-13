import { Component, inject } from '@angular/core';
import { ContactsService } from '../../firebase-services/contacts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactoverview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contactoverview.component.html',
  styleUrl: './contactoverview.component.scss',
})
export class ContactoverviewComponent {
  public contacts = inject(ContactsService);
  constructor() {
    this.contacts;
  }
  
}
