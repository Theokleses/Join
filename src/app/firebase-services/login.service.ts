import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _hideHelpIcon: boolean = false;
  private initialsSubject = new BehaviorSubject<string>('SM');
  initials$ = this.initialsSubject.asObservable();
  private firstNameSubject = new BehaviorSubject<string>('');
  firstName$ = this.firstNameSubject.asObservable();
  private lastNameSubject = new BehaviorSubject<string>('');
  lastName$ = this.lastNameSubject.asObservable();
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
    this.initialsSubject.next(initials);
  }

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
      console.log('Erfolgreich eingeloggt:', user);
      return { success: true, user }; // Rückgabe bei Erfolg
    } catch (error) {
      console.error('Fehler beim Einloggen:', error);
      return { success: false, error }; // Rückgabe bei Fehler
    }
  }
}
