import { CommonModule } from '@angular/common';
import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
import { LoginService } from '../firebase-services/login.service';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../firebase-services/tasks.service';

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
    private tasksService: TasksService,
  ) {}

  navigateToSummary() {
    this.appComponent.isLoggedIn = true;
    this.router.navigate(['/summary']);
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  guestLogin() {
    this.loginService.setInitials('G');
    this.loginService.setDisplayName('Guest');
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
      this.loginService
        .login(this.email, this.password)
        .then((result) => {
          if (result.success) {
            this.loginService.setFirstName(this.firstName || '');
            this.loginService.setLastName(this.lastName || '');
            this.navigateToSummary();
          } else {
            console.error('Login fehlgeschlagen:', result.error);
          }
        })
        .catch((error) => {
          console.error('Fehler beim Login:', error);
        });
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
