import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from './firebase.auth.service';

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
  private http = inject(HttpClient);
  private firebaseAuthService = inject(FirebaseAuthService);

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
    return users.some((u) => u.username === username);
  }

  register(
    username: string,
    password: string,
    displayName: string
  ): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();

    const exists = users.some((u) => u.username === username);
    if (exists) {
      return { success: false, error: 'Username is already taken' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    users.push({ username, password, displayName });
    this.saveRegisteredUsers(users);

    // Auto-login after registration
    const user: User = { username, displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    this.http.post(`${API}/register`, { username, display_name: displayName }).subscribe({
      next: (res) => console.log('register API:', res),
      error: (err) => console.log('Register API Error:', err),
    });

    return { success: true };
  }

  // ──────── LOGIN ────────
  login(username: string, password: string): { success: boolean; error?: string } {
    const users = this.getRegisteredUsers();

    const match = users.find((u) => u.username === username && u.password === password);

    if (!match) {
      return { success: false, error: 'Invalid username or password' };
    }

    const user: User = { username: match.username, displayName: match.displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    this.http.post(`${API}/login`, { username: match?.username, password }).subscribe({
      next: (res) => console.log('Login API:', res),
      error: (err) => console.log('Login API Error', err),
    });
    return { success: true };
  }

  // ──────── GOOGLE LOGIN ────────
  googleLogin(credential: string): { success: boolean; error?: string } {
    // Decode the JWT payload from Google (base64url-encoded)
    const payload = JSON.parse(
      atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    const email: string = payload.email;
    const name: string = payload.name || email.split('@')[0];

    // Use a clean username without separators like '-' or '_'.
    const users = this.getRegisteredUsers();
    const legacyUsername = email.replace(/[^a-zA-Z0-9_]/g, '_');
    const legacyFullEmailClean = email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const baseUsername = this.getGoogleUsernameBase(email);
    let match = users.find(
      (u) =>
        u.username.toLowerCase() === baseUsername.toLowerCase() ||
        u.username.toLowerCase() === legacyUsername.toLowerCase() ||
        u.username.toLowerCase() === legacyFullEmailClean
    );

    if (
      match &&
      (match.username.toLowerCase() === legacyUsername.toLowerCase() ||
        match.username.toLowerCase() === legacyFullEmailClean)
    ) {
      const canMigrate = !users.some(
        (u) => u !== match && u.username.toLowerCase() === baseUsername.toLowerCase()
      );
      if (canMigrate) {
        match.username = baseUsername;
        this.saveRegisteredUsers(users);
      }
    }

    if (!match) {
      // Auto-register on first Google login
      const username = this.getUniqueUsername(baseUsername, users);
      const newUser: StoredUser = { username, password: '', displayName: name };
      users.push(newUser);
      this.saveRegisteredUsers(users);
      match = newUser;
    }

    const user: User = { username: match.username, displayName: match.displayName };
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(user));

    this.http.post(`${API}/google_login`, { email, name }).subscribe({
      next: (res) => console.log('Google Login API:', res),
      error: (err) => console.log('Google Login API Error:', err),
    });

    return { success: true };
  }

  // ──────── LOGOUT ────────
  logout(): Promise<void> {
    const user = this.currentUser();
    if (user) {
      this.http.post(`${API}/logout`, { username: user.username }).subscribe({
        next: (res) => console.log('Logout API:', res),
        error: (err) => console.log('Logout API Error:', err),
      });
    }

    const finalizeLocalLogout = () => {
      this.currentUser.set(null);
      this.isLoggedIn.set(false);
      if (this.isBrowser) localStorage.removeItem(AUTH_KEY);
    };

    return this.firebaseAuthService
      .logout()
      .catch((err) => {
        console.log('Firebase Logout Error:', err);
      })
      .finally(finalizeLocalLogout);
  }

  // Updating user Profile

  updateProfile(
    newDisplayName: string,
    newPassword?: string,
    newUsername?: string
  ): { success: boolean; error?: string } {
    const current = this.currentUser();
    if (!current) return { success: false, error: 'Not logged in' };

    const users = this.getRegisteredUsers();
    const idx = users.findIndex((u) => u.username === current.username);

    if (idx === -1) return { success: false, error: 'User not found' };

    // Validate new username uniqueness (if changed)
    if (newUsername && newUsername !== current.username) {
      const taken = users.some((u, i) => i !== idx && u.username === newUsername);
      if (taken) return { success: false, error: 'Username is already taken.' };
    }

    const finalUsername = newUsername?.trim() || current.username;
    users[idx].username = finalUsername;
    users[idx].displayName = newDisplayName;
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters.' };
      }
      users[idx].password = newPassword;
    }
    this.saveRegisteredUsers(users);

    const updated: User = { username: finalUsername, displayName: newDisplayName };
    this.currentUser.set(updated);
    if (this.isBrowser) localStorage.setItem(AUTH_KEY, JSON.stringify(updated));

    this.http
      .put(`${API}/update_profile`, {
        username: current.username,
        new_username: finalUsername !== current.username ? finalUsername : null,
        new_display_name: newDisplayName,
      })
      .subscribe({
        next: (res) => console.log('Update Profile', res),
        error: (err) => console.log('Updated Profile API Error', err),
      });

    return { success: true };
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

  private getGoogleUsernameBase(email: string): string {
    const localPart = email.split('@')[0] ?? '';
    const cleaned = localPart.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    return cleaned.length >= 3 ? cleaned : 'user';
  }

  private getUniqueUsername(base: string, users: StoredUser[]): string {
    let candidate = base;
    let suffix = 1;
    while (users.some((u) => u.username === candidate)) {
      candidate = `${base}${suffix}`;
      suffix++;
    }
    return candidate;
  }
}
