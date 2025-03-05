import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = ''; 
  emailErrorMessage: string = ''; 
  passwordErrorMessage: string = ''; 
  confirmPasswordErrorMessage: string = ''; 
  isPrivacyAccepted: boolean = false;

  constructor(private router: Router, private loginService: LoginService) {}

  navigateToLogin() {
    this.router.navigate(['/login']); 
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isPrivacyAccepted = checkbox.checked;
    console.log('Checkbox status:', this.isPrivacyAccepted); 
  }

  signUp() {
    if (this.isPrivacyAccepted) {
      console.log('Sign up clicked!');
    }
  }

  private validateInputs(): boolean {
    let isValid = true;

    // Zurücksetzen der Fehlermeldungen
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.confirmPasswordErrorMessage = '';

    // Validierung des Namens
    if (!this.name) {
      isValid = false;
    }

    // Validierung der E-Mail
    if (!this.email) {
      this.emailErrorMessage = 'Email is required';
      isValid = false;
    } else if (!this.email.includes('@')) {
      this.emailErrorMessage = 'Invalid email address';
      isValid = false;
    }

    // Validierung des Passworts
    if (!this.password) {
      this.passwordErrorMessage = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordErrorMessage = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validierung der Passwort-Bestätigung
    if (!this.confirmPassword) {
      this.confirmPasswordErrorMessage = 'Confirm Password is required';
      isValid = false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordErrorMessage = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  async onSignUp() {
    this.errorMessage = ''; // Zurücksetzen der allgemeinen Fehlermeldung


    if (!this.validateInputs()) {
      return; 
    }

    // Firebase-Registrierung versuchen
    const result = await this.loginService.signUp(this.email, this.password);

    if (result.success) {
      console.log('Erfolgreich registriert:', result.user);
      this.router.navigate(['/login']); 
    } else {
      this.errorMessage = 'Registration failed. Please try again.'; 
    }
  }

}
