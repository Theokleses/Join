import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../firebase-services/login.service';
import { HelpUserComponent } from '../../help-user/help-user.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,HelpUserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  helpOpen = false;
  initials: string = 'SM';

  constructor(private loginService: LoginService, private router: Router) {}
  
  ngOnInit() {
    this.loginService.initials$.subscribe((newInitials) => {
      this.initials = newInitials; 
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  goToHelp() {
    this.router.navigate(['/help-user']);
  }


}