import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private initialsSubject = new BehaviorSubject<string>('SM');
  initials$ = this.initialsSubject.asObservable();

  constructor() {}

  setInitials(initials: string) {
    this.initialsSubject.next(initials);
  }
}
