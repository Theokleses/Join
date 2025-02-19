import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../firebase-services/contacts.service';
import { ContactaddComponent } from '../contactadd/contactadd.component';

@Component({
  selector: 'app-contactlist',
  standalone: true,
  imports: [CommonModule, ContactaddComponent],
  templateUrl: './contactlist.component.html',
  styleUrl: './contactlist.component.scss',
})
export class ContactlistComponent {
  public contacts = inject(ContactsService);
  isSmallScreen: boolean = window.innerWidth < 600;

  get groupedContacts() {
    return this.contacts.getGroupedContacts();
  }

  constructor() {
    this.contacts;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth < 600;
  }

  getButtonText(): string {
    return this.isSmallScreen ? '' : 'Add new Contact';
  }
}
