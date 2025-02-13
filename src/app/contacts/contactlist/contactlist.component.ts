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

  colors: string[] = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#FFBB2B',
    '#1FD7C1',
    '#462F8A',
  ];

  getColor(index: number): string {
    return this.colors[index % this.colors.length];
  }
}
