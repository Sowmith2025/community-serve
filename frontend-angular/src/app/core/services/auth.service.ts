import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  constructor(private api: ApiService) {
    // Initialize with current auth state after construction
    setTimeout(() => {
      const currentState = this.isAuthenticated();
      this.authStateSubject.next(currentState);
    }, 0);
  }

  async login(email: string, password: string) {
    const res = await this.api.client.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('authenticated', 'true');
    this.authStateSubject.next(true);
    return { token, user };
  }

  async register(userData: any) {
    const res = await this.api.client.post('/auth/register', userData);
    return res.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authenticated');
    this.authStateSubject.next(false);
  }

  getCurrentUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isSessionAuthenticated(): boolean {
    return sessionStorage.getItem('authenticated') === 'true';
  }

  isAuthenticated(): boolean {
    return this.isSessionAuthenticated() || !!this.getCurrentUser();
  }
}