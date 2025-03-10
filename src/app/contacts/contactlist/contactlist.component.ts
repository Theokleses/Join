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
  /**
   * Injects the ContactsService to access contact-related functionality.
   */
  public contacts = inject(ContactsService);

  /**
   * Tracks whether the screen width is less than 600 pixels.
   */
  isSmallScreen: boolean = window.innerWidth < 600;

  /**
   * Groups contacts alphabetically using the ContactsService.
   * @returns {Object} - An object where keys are letters and values are arrays of contacts.
   */
  get groupedContacts() {
    return this.contacts.getGroupedContacts();
  }

  constructor() {
    this.contacts;
  }

  /**
   * Listens for window resize events and updates the `isSmallScreen` property.
   * @param {any} event - The resize event object.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth < 600;
  }

  /**
   * Returns the appropriate button text based on the screen size.
   * @returns {string} - The button text ('Add new Contact' or an empty string).
   */
  getButtonText(): string {
    return this.isSmallScreen ? '' : 'Add new Contact';
  }
}
