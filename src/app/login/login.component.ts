import { CommonModule } from '@angular/common';
import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  emailErrorMessage: string = '';
  passwordErrorMessage: string = '';
  firstName: string = '';
  lastName: string = '';

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private loginService: LoginService
  ) {}

  navigateToSummary() {
    this.router.navigate(['/summary']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateTo(route: string) {
    this.loginService.setLinkClicked(true, true);
    this.router.navigate([route]);
    setTimeout(() => {
      this.loginService.setLinkClicked(false, false);
    }, 100);
  }

  async onLogin() {
    if (!this.validateInputs()) {
      setTimeout(() => {
        this.emailErrorMessage = '';
        this.passwordErrorMessage = '';
      }, 2000);
      return;
    }
    const result = await this.loginService.login(this.email, this.password);
    if (result.success) {
      this.navigateToSummary();
    } else {
      this.errorMessage = 'Incorrect email or password';
      setTimeout(() => (this.errorMessage = ''), 3000);
    }
  }

  handleGuestLogin() {
    this.loginService.loginAsGuest();
    this.navigateToSummary();
  }

  onInput(field: string) {
    if (field === 'email' && this.email) this.emailErrorMessage = '';
    if (field === 'password' && this.password) this.passwordErrorMessage = '';
  }

  validateInputs() {
    let isValid = true;
    this.emailErrorMessage = '';
    this.passwordErrorMessage = '';
    if (!this.email) {
      this.emailErrorMessage = 'Email is required';
      isValid = false;
    }
    if (!this.password) {
      this.passwordErrorMessage = 'Password is required';
      isValid = false;
    }
    return isValid;
  }

  ngAfterViewInit(): void {
    const logoElement = document.querySelector('.logo');
    const resetAnimation = () => {
      this.renderer.removeAttribute(logoElement, 'style');
      this.renderer.removeClass(logoElement, 'animate-logo');
      setTimeout(() => {
        this.renderer.addClass(logoElement, 'animate-logo');
        setTimeout(
          () => this.renderer.removeClass(logoElement, 'animate-logo'),
          2000
        );
      }, 10);
    };

    const mediaQuery = window.matchMedia('(max-width: 750px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) resetAnimation();
      else this.renderer.removeClass(logoElement, 'animate-logo');
    };
    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);
  }
}
