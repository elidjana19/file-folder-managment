import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import jwtDecode from 'jwt-decode';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  role:string
}
interface DecodedToken {
  role: string;
  // Add other fields from the token if necessary
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  

  private apiUrl = 'http://localhost:5103/api/User';
  private tokenKey = 'token';
  private roleKey = 'role';

  private roleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router:Router) {}


  //login
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        console.log(response, "resssss")
        this.storeToken(response.token);
        localStorage.setItem(this.roleKey, response.role);
        this.roleSubject.next(response.role);
      }),
      catchError(this.handleError)
    );
  }


  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  // getRole(): string | null {
  //   return localStorage.getItem('role');
  // }


  // decode the token to get the Role
   decodeJWT(token: string): any {
    if (!token) return null;
  
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('JWT does not have 3 parts');
      }
  
      const payload = parts[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT', error);
      return null;
    }}



  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken = this.decodeJWT(token);
    console.log(decodedToken, "dectokennn")
    return decodedToken.role;
  }

  getData(){
      const token = this.getToken();
      if (!token) return null;
      const decodedToken = this.decodeJWT(token);
      console.log(decodedToken, "dectokennn")
      return decodedToken
    
  }



  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isUser(): boolean {
    return this.getRole() === 'User';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.roleSubject.next(null);
   
    this.router.navigate([''])

  }

  //register

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.error.message ));
  }

  createUser(user: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  
    return this.http.post<any>(`${this.apiUrl}/register`, user, { headers }).pipe(
      tap(response => console.log('User created:', response)),
      catchError(this.handleError)
    )
  }



  // users

  getUsers():Observable<any[]>{
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}` 
    });
    return this.http.get<any[]>(`${this.apiUrl}/All Users`, {headers})
  }

  deleteUser(id:number){
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}` 
    });
   return this.http.delete(`${this.apiUrl}/${id}`, {headers})
  }

  changeRole(userId: number, newRole: string): Observable<any> {
    const url = `${this.apiUrl}/${userId}/change-role`;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}` ,
      'Content-Type': 'application/json'
    });

    const body = JSON.stringify({ newRole });
    return this.http.put(url, body, { headers });
  }



  changePassword(userId: number, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/change-password`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}` ,
      'Content-Type': 'application/json'
    });

    const body = {
      userId: userId,
      newPassword: newPassword
    };

    return this.http.post(url, body, { headers: headers, responseType: 'text' });
  }

 

  isFirstUser():Observable<boolean>{
    return this.http.get<boolean>(`${this.apiUrl}/is-empty`)
  }


  createFirstAdmin(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/CreateFirstUser`, { Username: username, Password: password }, { responseType: 'text' as 'json' });
  }
  

}
