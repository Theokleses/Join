import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { TasksComponent } from './tasks/tasks.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SummaryComponent } from './summary/summary.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';
import { HelpUserComponent } from './help-user/help-user.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', component: LoginComponent },
  { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [authGuard] },
  { path: 'board', component: BoardComponent, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsComponent, canActivate: [authGuard] },
  {
    path: 'privacy-notice',
    component: PrivacyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'legal-notice',
    component: LegalNoticeComponent,
    canActivate: [authGuard],
  },
  { path: 'help-user', component: HelpUserComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' },
];
