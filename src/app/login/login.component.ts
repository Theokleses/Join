import { CommonModule } from '@angular/common';
import { Component, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private appComponent: AppComponent,
    private renderer: Renderer2
  ) {}

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

  navigateToSummary() {
    this.appComponent.isLoggedIn = true;
    this.router.navigate(['/summary']);
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
