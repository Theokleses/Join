import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../firebase-services/login.service';
import { HelpUserComponent } from '../../help-user/help-user.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HelpUserComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  helpOpen = false;
  initials: string = '';
  isLoginContext: boolean = false;
  constructor(public loginService: LoginService, private router: Router) {}

  ngOnInit() {
    this.loginService.initials$.subscribe((newInitials) => {
      this.initials = newInitials;
    });
    this.checkRoute();
    this.router.events.subscribe(() => this.checkRoute())
  }

  checkRoute() {
    const currentUrl = this.router.url;
    console.log('Header - Current URL:', currentUrl);
    this.isLoginContext = ['/login', '/privacy-notice', '/legal-notice'].includes(currentUrl);
    console.log('Header - isLoginContext:', this.isLoginContext);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  goToHelp() {
    this.loginService.setHideHelpIcon(true);
    this.router.navigate(['/help-user']);
  }

  logout() {
    this.loginService.logout(); 
    this.closeMenu(); 
    this.router.navigate(['/login']); 
  }
}
