import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';

export const routes: Routes = [
  //   { path: 'contacts', component: ContactsComponent }, wenn contacts fertig ist wieder einfügen fürs testen ist path leer
  { path: '', component: ContactsComponent },
];
