import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.getToken(); 
    const role = this.authService.getRole(); 
  
    console.log('Is Logged In:', isLoggedIn); 
    console.log('Role:', role);               
  
    if (role ==="Admin") {
        return true;  
      }  else {
        this.router.navigate(['/login']);  
        return false;
      }
    
  }
}
