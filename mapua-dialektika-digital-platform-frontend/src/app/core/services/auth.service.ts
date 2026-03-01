import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject, from } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //Placeholder for API calling of login
  constructor(private http: HttpClient){}
  onLogin(obj: any) : Observable<any> {
    return this.http.post('http://localhost:8000/rest/login', obj);
  }


  /*login(email: string, password: string): Observable<unknown> {
    const isValid = email.trim() === 'user@example.com' && password.trim() === 'password123';
    if (isValid) {
      return of({ ok: true }).pipe(delay(150));
    }
    return throwError(() => new Error('Invalid Credentials!')).pipe(delay(150));
  }*/
}