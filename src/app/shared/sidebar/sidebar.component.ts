import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../firebase-services/login.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  activeTab: string = 'summary';
  isLoginContext: boolean = false;

  constructor(
    private router: Router,
    public loginService: LoginService,
  ) {}

  /**
   * Initializes the component by checking the current route and subscribing to router events.
   * This ensures the active tab and login context are updated on initialization and navigation.
   */
  ngOnInit() {
    this.checkRoute();
    this.router.events.subscribe(() => this.checkRoute());
  }

  /**
   * Navigates to the specified route and updates the active tab.
   * Temporarily sets a flag in the login service to indicate a link was clicked.
   * @param {string} route - The route to navigate to (e.g., '/privacy-notice').
   */
  navigateTo(route: string) {
    this.loginService.setLinkClicked(true);
    this.activeTab = route.replace('/', '');
    this.router.navigate([route]);
    setTimeout(() => this.loginService.setLinkClicked(false), 100);
  }

  /**
   * Checks the current route and updates the active tab and login context accordingly.
   * Sets `isLoginContext` based on login status and current URL, and updates `activeTab`
   * to reflect the current route.
   */
  checkRoute() {
    const currentUrl = this.router.url;
    this.isLoginContext =
      !this.loginService.isLoggedIn &&
      (currentUrl === '/login' ||
        currentUrl === '/privacy-notice' ||
        currentUrl === '/legal-notice');

    switch (currentUrl) {
      case '/summary':
        this.activeTab = 'summary';
        break;
      case '/tasks':
        this.activeTab = 'tasks';
        break;
      case '/board':
        this.activeTab = 'board';
        break;
      case '/contacts':
        this.activeTab = 'contacts';
        break;
      case '/privacy-notice':
        this.activeTab = 'privacy-notice';
        break;
      case '/legal-notice':
        this.activeTab = 'legal-notice';
        break;
      case '/login':
        this.activeTab = '';
        break;
      default:
        this.activeTab = 'summary';
    }
  }

  /**
   * Sets the active tab to the specified value and re-checks the current route.
   * Used when a sidebar link is clicked to update the highlighted tab.
   * @param {string} tab - The tab to set as active (e.g., 'board', 'summary').
   */
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.checkRoute();
  }

  /**
   * Logs the user out and navigates to the login page.
   * Calls the logout method from the login service and redirects to '/login'.
   */
  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
