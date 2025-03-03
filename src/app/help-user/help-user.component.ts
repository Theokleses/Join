import { Component} from '@angular/core';
import { Location } from '@angular/common';
import { LoginService } from '../firebase-services/login.service';

@Component({
  selector: 'app-help-user',
  standalone: true,
  imports: [],
  templateUrl: './help-user.component.html',
  styleUrl: './help-user.component.scss'
})
export class HelpUserComponent {
 constructor(private location: Location, private loginService: LoginService) {}

closeHelp() {
  this.loginService.setHideHelpIcon(false); 
  this.location.back(); 
}
}
