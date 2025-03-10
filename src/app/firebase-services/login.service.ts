import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _hideHelpIcon: boolean = false;
  private initialsSubject = new BehaviorSubject<string>('');
  initials$ = this.initialsSubject.asObservable();
  private firstNameSubject = new BehaviorSubject<string>('');
  firstName$ = this.firstNameSubject.asObservable();
  private lastNameSubject = new BehaviorSubject<string>('');
  lastName$ = this.lastNameSubject.asObservable();
  private displayNameSubject = new BehaviorSubject<string>('');
  displayName$ = this.displayNameSubject.asObservable();
  auth = getAuth();
  isLoggedIn: boolean = localStorage.getItem('isLoggedIn') === 'true';
  isGuest: boolean = localStorage.getItem('isGuest') === 'true';

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user && !this.isGuest) {
        this.isLoggedIn = true;
        this.isGuest = false;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isGuest', 'false');
        const displayName =
          user.displayName || localStorage.getItem('displayName') || '';
        const initials =
          displayName
            .split(' ')
            .map((n) => n.charAt(0))
            .join('')
            .toUpperCase() ||
          localStorage.getItem('initials') ||
          '';
        this.setDisplayName(displayName);
        this.setInitials(initials);
      } else if (this.isGuest) {
        this.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        this.setDisplayName(localStorage.getItem('displayName') || 'Guest');
        this.setInitials(localStorage.getItem('initials') || 'G');
      } else {
        this.isLoggedIn = false;
        this.isGuest = false;
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.setItem('isGuest', 'false');
        this.setDisplayName('');
        this.setInitials('');
      }
    });
  }

  /**
   * Updates the initials value in the BehaviorSubject.
   * @param {string} initials - The new initials to set.
   */
  updateInitials(initials: string) {
    this.initialsSubject.next(initials);
  }

  /**
   * Gets the current state of the help icon visibility.
   * @returns {boolean} True if the help icon is hidden, false otherwise.
   */
  get hideHelpIcon(): boolean {
    return this._hideHelpIcon;
  }

  /**
   * Sets the visibility state of the help icon.
   * @param {boolean} value - The new visibility state.
   */
  setHideHelpIcon(value: boolean) {
    this._hideHelpIcon = value;
  }

  /**
   * Sets the first name in the BehaviorSubject.
   * @param {string} firstName - The first name to set.
   */
  setFirstName(firstName: string) {
    this.firstNameSubject.next(firstName);
  }

  /**
   * Sets the last name in the BehaviorSubject.
   * @param {string} lastName - The last name to set.
   */
  setLastName(lastName: string) {
    this.lastNameSubject.next(lastName);
  }

  /**
   * Sets the initials in the BehaviorSubject and local storage.
   * @param {string} initials - The initials to set.
   */
  setInitials(initials: string) {
    this.initialsSubject.next(initials);
    localStorage.setItem('initials', initials);
  }

  /**
   * Sets the display name in the BehaviorSubject and local storage.
   * @param {string} displayName - The display name to set.
   */
  setDisplayName(displayName: string) {
    this.displayNameSubject.next(displayName);
    localStorage.setItem('displayName', displayName);
  }

  /**
   * Signs up a new user with email, password, and display name.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @param {string} displayName - The user's display name.
   * @returns {Promise<{ success: boolean; user?: any; error?: any }>} The result of the sign-up attempt.
   */
  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName });
      this.isLoggedIn = true;
      localStorage.setItem('isLoggedIn', 'true');
      console.log('Erfolgreich registriert:', user);
      return { success: true, user };
    } catch (error) {
      console.error('Fehler bei der Registrierung:', error);
      return { success: false, error };
    }
  }

  /**
   * Logs in a user with email and password.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<{ success: boolean; user?: any; error?: any }>} The result of the login attempt.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      const user = userCredential.user;
      this.handleSuccessfulLogin(user);
      return { success: true, user };
    } catch (error) {
      console.error('Fehler beim Einloggen:', error);
      return { success: false, error };
    }
  }

  /**
   * Handles the logic after a successful login.
   * @param {any} user - The authenticated user object.
   */
  private handleSuccessfulLogin(user: any) {
    this.isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    if (user.displayName) {
      this.processDisplayName(user.displayName);
    } else {
      console.log('Kein Display Name gesetzt.');
      this.setDisplayName('');
    }
  }

  /**
   * Processes the display name to set formatted name and initials.
   * @param {string} displayName - The raw display name from the user.
   */
  private processDisplayName(displayName: string) {
    const [firstName, lastName] = displayName
      .split(' ')
      .map(
        (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      );
    const formattedDisplayName = [firstName, lastName]
      .filter(Boolean)
      .join(' ');
    const initials =
      (firstName ? firstName.charAt(0) : '') +
      (lastName ? lastName.charAt(0) : '');
    this.setDisplayName(formattedDisplayName);
    this.setInitials(initials.toUpperCase());
  }

  /**
   * Logs in the user as a guest without authentication.
   */
  loginAsGuest() {
    this.isLoggedIn = true;
    this.isGuest = true;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isGuest', 'true');
    this.setDisplayName('Guest');
    this.setInitials('G');
  }

  /**
   * Logs out the current user and clears authentication state.
   */
  logout() {
    this.auth.signOut();
    this.isLoggedIn = false;
    this.isGuest = false;
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.setItem('isGuest', 'false');
  }
}
