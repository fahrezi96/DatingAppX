import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, ReplaySubject } from 'rxjs';
import { User } from '../models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  login(model: { username: string; password: string }) {
    return this.http.post(`${this.baseUrl}account/login`, model).pipe(
      map((res: User) => {
        const user = res;
        if (user) {
          this.setCurrentUser(user);
        }

        return res;
      })
    );
  }

  register(model: any) {
    return this.http.post(`${this.baseUrl}account/register`, model).pipe(
      map((res: User) => {
        if (res) {
          this.setCurrentUser(res);
        }

        return res;
      })
    );
  }

  setCurrentUser(user: User) {
    console.log(user);
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
