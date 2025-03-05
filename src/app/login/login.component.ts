import { CommonModule } from '@angular/common';
import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
    private appComponent: AppComponent,
    private renderer: Renderer2,
    private loginService: LoginService,
  ) {}

  navigateToSummary() {
    this.appComponent.isLoggedIn = true;
    this.router.navigate(['/summary']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  guestLogin() {
    this.firstName = 'Guest';
    this.lastName = '';
    this.loginService.setFirstName(this.firstName);
    this.loginService.setInitials('G');
  }

  handleGuestLogin() {
    this.guestLogin();
    this.navigateToSummary();
  }

  async onLogin() {
    this.errorMessage = '';

    if (!this.validateInputs()) {
      return;
    }

    const result = await this.loginService.login(this.email, this.password);

    if (result.success) {
      this.navigateToSummary();
      this.handleLogin();
    } else {
      this.errorMessage = 'Incorrect email or password';
    }
  }

  onInput(field: string) {
    if (field === 'email' && this.email) {
      this.emailErrorMessage = '';
    } else if (field === 'password' && this.password) {
      this.passwordErrorMessage = '';
    }
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

  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  handleLogin() {
    if (this.email && this.email.includes('@')) {
      const namePart = this.email.split('@')[0];
      let initials = '';
      // Fall 1: Mit Punkt getrennt (z. B. "max.mustermann")
      if (namePart.includes('.')) {
        const names = namePart.split('.');
        if (names.length >= 2) {
          this.firstName = this.capitalizeFirstLetter(names[0]);
          this.lastName = this.capitalizeFirstLetter(names[1]);
          initials =
            names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
        }
      }
      // Fall 2: Mit Bindestrich getrennt (z. B. "max-mustermann")
      else if (namePart.includes('-')) {
        const names = namePart.split('-');
        if (names.length >= 2) {
          this.firstName = this.capitalizeFirstLetter(names[0]);
          this.lastName = this.capitalizeFirstLetter(names[1]);
          initials =
            names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
        }
      }
      // Fall 3: Mit Unterstrich getrennt (z. B. "max_mustermann")
      else if (namePart.includes('_')) {
        const names = namePart.split('_');
        if (names.length >= 2) {
          this.firstName = this.capitalizeFirstLetter(names[0]);
          this.lastName = this.capitalizeFirstLetter(names[1]);
          initials =
            names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
        }
      }
      // Fall 4: Mit Großbuchstaben (z. B. "maxMustermann")
      else if (namePart.match(/[A-Z]/)) {
        const nameParts = namePart.split(/(?=[A-Z])/);
        if (nameParts.length >= 2) {
          this.firstName = this.capitalizeFirstLetter(nameParts[0]);
          this.lastName = this.capitalizeFirstLetter(nameParts[1]);
          initials =
            nameParts[0].charAt(0).toUpperCase() +
            nameParts[1].charAt(0).toUpperCase();
        }
      }
      // Fall 5: Keine klare Trennung (z. B. "maxmustermann")
      else {
        this.firstName = namePart.slice(0, 1).toUpperCase();
        this.lastName = namePart.slice(1, 2).toUpperCase();
        initials = namePart.slice(0, 2).toUpperCase(); // Erste zwei Buchstaben
      }
      this.loginService.setFirstName(this.firstName);
      this.loginService.setLastName(this.lastName);
      this.loginService.setInitials(initials);
      this.navigateToSummary();
    } else {
      console.log('Ungültige Email-Adresse');
    }
  }

  ngAfterViewInit(): void {
    const logoElement = document.querySelector('.logo');
    const resetAnimation = () => {
      this.renderer.removeAttribute(logoElement, 'style');
      this.renderer.removeClass(logoElement, 'animate-logo');
      setTimeout(() => {
        this.renderer.addClass(logoElement, 'animate-logo');
        setTimeout(() => {
          this.renderer.removeClass(logoElement, 'animate-logo');
        }, 2000);
      }, 10);
    };

    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        resetAnimation();
      } else {
        this.renderer.removeClass(logoElement, 'animate-logo');
      }
    };
    handleMediaChange(mediaQuery);
    mediaQuery.addEventListener('change', handleMediaChange);
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
