import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from '../services';
import { Router } from '@angular/router';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.userService.isAuthenticated();
    if (!isAuthenticated) {
      console.error("User is not authenticated");
      this.router.navigate(['/login', {loginMessage: "You are not authenticated. Please login."}])
    }
    return isAuthenticated;
  }
}
