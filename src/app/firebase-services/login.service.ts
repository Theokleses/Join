import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
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
        const displayName = user.displayName || localStorage.getItem('displayName') || '';
        const initials = displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || localStorage.getItem('initials') || '';
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

  updateInitials(initials: string) {
    this.initialsSubject.next(initials);
  }

  get hideHelpIcon(): boolean {
    return this._hideHelpIcon;
  }

  setHideHelpIcon(value: boolean) {
    this._hideHelpIcon = value;
  }

  setFirstName(firstName: string) {
    this.firstNameSubject.next(firstName);
  }

  setLastName(lastName: string) {
    this.lastNameSubject.next(lastName);
  }

  setInitials(initials: string) {
    this.initialsSubject.next(initials);
    localStorage.setItem('initials', initials);
  }

  setDisplayName(displayName: string) {
    this.displayNameSubject.next(displayName);
    localStorage.setItem('displayName', displayName);
  }

  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
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

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      this.isLoggedIn = true;  
      localStorage.setItem('isLoggedIn', 'true');
      if (user.displayName) {
        const [firstName, lastName] = user.displayName.split(' ').map(name => 
          name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        );
        const formattedDisplayName = [firstName, lastName].filter(Boolean).join(' ');
        this.setDisplayName(formattedDisplayName);
        const initials = 
          (firstName ? firstName.charAt(0) : '') + 
          (lastName ? lastName.charAt(0) : '');
        this.setInitials(initials.toUpperCase());
      } else {
        console.log('Kein Display Name gesetzt.');
        this.setDisplayName(''); 
      }
      return { success: true, user };
    } catch (error) {
      console.error('Fehler beim Einloggen:', error);
      return { success: false, error };
    }
  }

  loginAsGuest() { 
    this.isLoggedIn = true;
    this.isGuest = true;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isGuest', 'true');
    this.setDisplayName('Guest');
    this.setInitials('G');
  }

  // logout() {
  //   this.auth.signOut();
  //   this.isLoggedIn = false;
  //   localStorage.setItem('isLoggedIn', 'false');
  //   this.setDisplayName(''); // Zurücksetzen
  //   this.setInitials(''); // Zurücksetzen (statt 'GM')
  // }
}
