import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

declare const firebase: any;

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBffL6zLdO4bBIF9Sr-9oSMjbBulUGWTNE',
  authDomain: 'sprintly-61099.firebaseapp.com',
  projectId: 'sprintly-61099',
  storageBucket: 'sprintly-61099.firebasestorage.app',
  messagingSenderId: '504777175672',
  appId: '1:504777175672:web:fc9b43c9262c4fe92bb38d',
  measurementId: 'G-P9TVLF0F3S',
};

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private firebaseReady = false;

  constructor() {
    if (this.isBrowser) {
      this.initializeFirebase();
    }
  }

  private get firebaseSdk(): any {
    return (globalThis as any).firebase;
  }

  private initializeFirebase() {
    const firebase = this.firebaseSdk;
    if (!firebase) {
      // Try again in 200ms
      setTimeout(() => this.initializeFirebase(), 200);
      return;
    }

    if (!this.firebaseReady) {
      if (!firebase.apps?.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      this.firebaseReady = true;
    }
  }

  // Google Sign-In
  signInWithGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      const firebase = this.firebaseSdk;
      if (!firebase || !this.firebaseReady) {
        reject(new Error('Firebase SDK not ready. Refresh and try again.'));
        return;
      }

      const auth = firebase.auth();
      const provider = new firebase.auth.GoogleAuthProvider();

      auth
        .signInWithPopup(provider)
        .then((result: any) => {
          resolve(this.toUserData(result?.user));
        })
        .catch((error: any) => {
          if (error?.code === 'auth/popup-blocked') {
            auth
              .signInWithRedirect(provider)
              .then(() => resolve({ redirecting: true }))
              .catch((redirectError: any) => reject(redirectError));
            return;
          }
          console.error('Google Sign-In Error:', error);
          reject(error);
        });
    });
  }

  completeRedirectSignIn(): Promise<any | null> {
    const firebase = this.firebaseSdk;
    if (!firebase || !this.firebaseReady) return Promise.resolve(null);

    const auth = firebase.auth();
    return auth.getRedirectResult().then((result: any) => {
      const user = result?.user;
      if (!user) return null;
      return this.toUserData(user);
    });
  }

  // Logout
  logout(): Promise<void> {
    const firebase = this.firebaseSdk;
    if (!firebase || !this.firebaseReady) {
      localStorage.removeItem('kanban_user');
      return Promise.resolve();
    }

    const auth = firebase.auth();
    return auth.signOut().then(() => {
      localStorage.removeItem('kanban_user');
    });
  }

  // Helper: Generate username from email
  private getUsername(email: string): string {
    const localPart = email?.split('@')[0] ?? '';
    return localPart.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
  }

  private toUserData(user: any) {
    const userData = {
      username: this.getUsername(user?.email ?? ''),
      displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
      email: user?.email ?? '',
    };

    localStorage.setItem('kanban_user', JSON.stringify(userData));
    return userData;
  }
}
