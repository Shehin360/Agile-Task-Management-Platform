import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const AUTH_KEY = 'kanban_user';

interface User {
  username: string;
  displayName: string;
}

// Hardcoded credentials
const VALID_USERS = [
  { username: 'admin', password: 'admin123', displayName: 'Admin' },
  { username: 'shehin', password: 'shehin123', displayName: 'Shehin' },
  { username: 'demo', password: 'demo', displayName: 'Demo User' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = signal<boolean>(this.loadUser() !== null);

  login(username: string, password: string): { success: boolean; error?: string } {
    const match = VALID_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!match) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user: User = { username: match.username, displayName: match.displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    return { success: true };
  }

  logout() {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (this.isBrowser) localStorage.removeItem(AUTH_KEY);
  }

  private loadUser(): User | null {
    if (!this.isBrowser) return null;
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  }
}
