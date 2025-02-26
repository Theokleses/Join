import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private router: Router, private appComponent: AppComponent) {}

  navigateToSummary() {
    this.appComponent.isLoggedIn = true; // Setze den Anmeldestatus auf true
    this.router.navigate(['/summary']); // Navigiere zur SummaryComponent
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}

// constructor(private router: Router) {}

// navigateToSummary() {
//   this.router.navigate(['/summary']); // Navigiere zur SummaryComponent
// }

//  navigateToSignup() {
//   this.router.navigate(['/signup']);
// }
// }
