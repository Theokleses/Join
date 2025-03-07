import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from './firebase-services/login.service'; 

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService); 
  const router = inject(Router); 

  if (loginService.isLoggedIn) {
    return true; 
  } else {
    router.navigate(['/login']); 
    return false; 
  }
};