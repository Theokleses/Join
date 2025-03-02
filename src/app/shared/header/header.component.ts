import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../firebase-services/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] 
})
export class HeaderComponent implements OnInit {
  menuOpen = false;
  initials: string = 'SM';

  constructor(private loginService: LoginService) {}

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
}