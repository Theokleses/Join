import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private _hideHelpIcon: boolean = false;
  private initialsSubject = new BehaviorSubject<string>('SM');
  initials$ = this.initialsSubject.asObservable();

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

  setInitials(initials: string) {
    this.initialsSubject.next(initials);
  }
}
