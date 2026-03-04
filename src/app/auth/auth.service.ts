import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';


const AUTH_KEY = 'kanban_user';
const USERS_KEY = 'kanban_registered_users';
const API = 'http://localhost:8000';

export interface User {
  username: string;
  displayName: string;
}

interface StoredUser {
  username: string;
  password: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient)

  currentUser = signal<User | null>(this.loadSession());
  isLoggedIn = signal<boolean>(this.loadSession() !== null);

  constructor() {
    // Seed a default demo user on first load if no users exist
    if (this.isBrowser) {
      const users = this.getRegisteredUsers();
      if (users.length === 0) {
        this.saveRegisteredUsers([
          { username: 'demo', password: 'demo1234', displayName: 'Demo User' },
        ]);
      }
    }
  }

  // ──────── REGISTER ────────
  isUsernameTaken(username: string): boolean {
    const users = this.getRegisteredUsers();
    return users.some((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  register(
    username: string,
    password: string,
    displayName: string
  ): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();

    const exists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { success: false, error: 'Username is already taken' };
    }

    users.push({ username, password, displayName });
    this.saveRegisteredUsers(users);

    // Auto-login after registration
    const user: User = { username, displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    this.http.post(`${API}/register`, {username, display_name:displayName})
    .subscribe({
      next: (res) => console.log('register API:', res),
      error: (err) => console.log('Register API Error:', err)
    });

    return { success: true };
  }

  // ──────── LOGIN ────────
  login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();

    const match = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!match) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user: User = { username: match.username, displayName: match.displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));


  this.http.post(`${API}/login`, {username:match?.username, password: ''})
    .subscribe({
      next: (res) => console.log('Login API:', res),
      error: (err) => console.log('Login API Error', err),
    });
        return { success: true };
  }

  // ──────── LOGOUT ────────
  logout() {
    const user = this.currentUser();
    if(user){
      this.http.post(`${API}/logout`, {username: user.username, password: ''})
      .subscribe({
        next: (res) => console.log('Logout API:', res),
        error: (err) => console.log('Logout API Error:', err),
      });
    }

    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (this.isBrowser) localStorage.removeItem(AUTH_KEY);
  }

  // ──────── HELPERS ────────
  private loadSession(): User | null {
    if (!this.isBrowser) return null;
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  }

  private getRegisteredUsers(): StoredUser[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  }

  private saveRegisteredUsers(users: StoredUser[]) {
    if (this.isBrowser) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}
