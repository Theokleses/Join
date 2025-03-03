import { Component} from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help-user',
  standalone: true,
  imports: [],
  templateUrl: './help-user.component.html',
  styleUrl: './help-user.component.scss'
})
export class HelpUserComponent {
 constructor(private location: Location) {}
 closeHelp() {
  this.location.back();

}
}
