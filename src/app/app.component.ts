import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactsService } from './firebase-services/contacts.service';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Join';

  public contacts = inject(ContactsService);

  constructor() {
    this.contacts;
  }
}
