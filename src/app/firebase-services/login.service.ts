import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _hideHelpIcon: boolean = false;
  private initialsSubject = new BehaviorSubject<string>('GM');
  initials$ = this.initialsSubject.asObservable();
  private firstNameSubject = new BehaviorSubject<string>('');
  firstName$ = this.firstNameSubject.asObservable();
  private lastNameSubject = new BehaviorSubject<string>('');
  lastName$ = this.lastNameSubject.asObservable();
  private displayNameSubject = new BehaviorSubject<string>('');
  displayName$ = this.displayNameSubject.asObservable();
  auth = getAuth();

  constructor() {}

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
    console.log('Setting initials to:', initials, 'from:', new Error().stack);
    this.initialsSubject.next(initials);
  }

  setDisplayName(displayName: string) {
    this.displayNameSubject.next(displayName);
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
}
