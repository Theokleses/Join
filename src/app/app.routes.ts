import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { TasksComponent } from './tasks/tasks.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SummaryComponent } from './summary/summary.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';

export const routes: Routes = [
  //   { path: '', component: ContactsComponent }, wenn contacts fertig ist wieder einfügen fürs testen ist path leer
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', component: LoginComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'board', component: BoardComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'privacy-notice', component: PrivacyComponent },
  { path: 'legal-notice', component: LegalNoticeComponent },
];
