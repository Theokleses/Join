import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './firebase-services/login.service';

@Injectable({
  providedIn: 'root',
})
export class LinkGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(): boolean {
    if (this.loginService.getLinkClicked()) {
      return true; 
    }
    this.router.navigate(['/']); 
    return false;
  }
}