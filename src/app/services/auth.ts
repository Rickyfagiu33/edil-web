import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'edilsolido_auth';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.checkExistingLogin();
  }

  private checkExistingLogin(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.storageKey);
      this.isLoggedInSubject.next(token === 'authenticated');
    }
  }

  login(username: string, password: string): boolean {
    // Credenziali hardcoded di esempio
    if (username === 'admin' && password === 'EdilSolido2024') {
      this.isLoggedInSubject.next(true);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, 'authenticated');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this.isLoggedInSubject.next(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
