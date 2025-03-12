import { Component} from '@angular/core';
import { Location } from '@angular/common';
import { LoginService } from '../firebase-services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-user',
  standalone: true,
  imports: [],
  templateUrl: './help-user.component.html',
  styleUrl: './help-user.component.scss'
})
export class HelpUserComponent {
 constructor(private router: Router, private loginService: LoginService ,) {}

closeHelp() {
  this.loginService.setHideHelpIcon(false); 
  this.router.navigate(['/summary']);
}
}
