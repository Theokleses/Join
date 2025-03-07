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
  displayName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  nameErrorMessage: string = '';
  emailErrorMessage: string = '';
  passwordErrorMessage: string = '';
  confirmPasswordErrorMessage: string = '';
  isPrivacyAccepted: boolean = false;
  isFormSubmitted: boolean = false;
  showSuccessMessage: boolean = false;

  isNameTouched: boolean = false;
  isEmailTouched: boolean = false;
  isPasswordTouched: boolean = false;
  isConfirmPasswordTouched: boolean = false;

  constructor(private router: Router, private loginService: LoginService) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  onCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isPrivacyAccepted = checkbox.checked;
  }

  onInputTouched(field: string) {
    if (field === 'name') this.isNameTouched = true;
    if (field === 'email') this.isEmailTouched = true;
    if (field === 'password') this.isPasswordTouched = true;
    if (field === 'confirmPassword') this.isConfirmPasswordTouched = true;

    this.validateInputs();
  }

  isFormValid(): boolean {
    return this.validateInputs() && this.isPrivacyAccepted;
  }

  private validateInputs(): boolean {
    let isValid = true;

    this.nameErrorMessage = '';
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    this.confirmPasswordErrorMessage = '';

    // Validierung des Namens
    if (!this.displayName && this.isNameTouched) {
      this.nameErrorMessage = 'Name is required';
      isValid = false;
    } else if (this.isNameTouched) {
      const nameParts = this.displayName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        this.nameErrorMessage = 'Please enter both first and last name';
        isValid = false;
      } else {
        const lettersOnlyRegex = /^[a-zA-Z]+$/;
        for (const part of nameParts) {
          if (!lettersOnlyRegex.test(part)) {
            this.nameErrorMessage = 'Name must contain only letters';
            isValid = false;
            break;
          }
        }
      }
    }

    // Validierung der E-Mail
    if (!this.email && this.isEmailTouched) {
      this.emailErrorMessage = 'Email is required';
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email) &&
      this.isEmailTouched
    ) {
      this.emailErrorMessage =
        'Invalid email address (e.g., example@domain.com)';
      isValid = false;
    }

    // Validierung des Passworts
    if (!this.password && this.isPasswordTouched) {
      this.passwordErrorMessage = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6 && this.isPasswordTouched) {
      this.passwordErrorMessage = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validierung der Passwort-Bestätigung
    if (!this.confirmPassword && this.isConfirmPasswordTouched) {
      this.confirmPasswordErrorMessage = 'Confirm Password is required';
      isValid = false;
    } else if (
      this.password !== this.confirmPassword &&
      this.isConfirmPasswordTouched
    ) {
      this.confirmPasswordErrorMessage = 'Passwords do not match';
      isValid = false;
    }

    return isValid;
  }

  async onSignUp() {
    this.isFormSubmitted = true;
    this.errorMessage = '';

    this.isNameTouched = true;
    this.isEmailTouched = true;
    this.isPasswordTouched = true;
    this.isConfirmPasswordTouched = true;

    if (!this.validateInputs()) {
      return;
    }

    const result = await this.loginService.signUp(
      this.email,
      this.password,
      this.displayName
    );

    if (result.success) {
      this.showSuccessMessage = true;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else {
      this.errorMessage = 'Registration failed. Please try again.';
    }
  }
}
