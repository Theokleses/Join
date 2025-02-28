import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  isPrivacyAccepted: boolean = false;

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']); 
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isPrivacyAccepted = checkbox.checked; // Aktualisiert den Status
    console.log('Checkbox status:', this.isPrivacyAccepted); // Debugging
  }

  signUp() {
    if (this.isPrivacyAccepted) {
      console.log('Sign up clicked!');
      // Hier kannst du deine Signup-Logik einfügen, z. B. this.router.navigate(['/somewhere']);
    }
  }

}
