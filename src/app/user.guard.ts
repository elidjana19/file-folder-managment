import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.authService.getRole();

    if (role === 'User') {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
