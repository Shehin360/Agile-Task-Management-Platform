import {
  Component,
  signal,
  computed,
  inject,
  AfterViewInit,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FirebaseAuthService } from '../auth/firebase.auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('shake', [
      transition('* => error', [
        animate('80ms', style({ transform: 'translateX(-8px)' })),
        animate('80ms', style({ transform: 'translateX(8px)' })),
        animate('80ms', style({ transform: 'translateX(-6px)' })),
        animate('80ms', style({ transform: 'translateX(6px)' })),
        animate('80ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class Login implements AfterViewInit {
  private authService = inject(AuthService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  isLoading = signal(false);
  shakeState = signal('');
  showPassword = signal(false);

  // ──────── FIELD VALIDATION ────────
  usernameTouched = signal(false);
  passwordTouched = signal(false);

  usernameError = computed(() => {
    if (!this.usernameTouched()) return null;
    const val = this.username().trim();
    if (!val) return 'Username is required';
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (/[^a-zA-Z0-9_]/.test(val)) return 'Only letters, numbers & underscores allowed';
    return null;
  });

  passwordError = computed(() => {
    if (!this.passwordTouched()) return null;
    const val = this.password();
    if (!val) return 'Password is required';
    if (val.length < 4) return 'Password must be at least 4 characters';
    return null;
  });

  isFormValid = computed(() => {
    const u = this.username().trim();
    const p = this.password();
    return u.length >= 3 && !/[^a-zA-Z0-9_]/.test(u) && p.length >= 4;
  });

  onUsernameInput(value: string) {
    this.username.set(value);
    if (this.error()) this.error.set(null);
  }

  onPasswordInput(value: string) {
    this.password.set(value);
    if (this.error()) this.error.set(null);
  }

  onUsernameBlur() {
    this.usernameTouched.set(true);
  }

  onPasswordBlur() {
    this.passwordTouched.set(true);
  }

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/board']);
    }
  }
  //google sign in
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.firebaseAuthService
      .completeRedirectSignIn()
      .then((userData) => {
        if (!userData) return;
        this.ngZone.run(() => {
          const user = {
            username: userData.username,
            displayName: userData.displayName,
          };
          this.authService.currentUser.set(user);
          this.authService.isLoggedIn.set(true);
          this.router.navigate(['/board']);
        });
      })
      .catch((error) => {
        this.ngZone.run(() => {
          console.error('Redirect login error:', error);
          this.error.set(this.getGoogleErrorMessage(error));
        });
      });
  }

  handleGoogleCredential(response: any) {
    this.ngZone.run(() => {
      this.isLoading.set(true);
      this.error.set(null);

      const result = this.authService.googleLogin(response.credential);
      if (result.success) {
        this.router.navigate(['/board']);
      } else {
        this.error.set(result.error ?? 'Google sign-in failed');
        this.shakeState.set('error');
        setTimeout(() => this.shakeState.set(''), 500);
      }
      this.isLoading.set(false);
    });
  } ///

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit() {
    // Mark both fields as touched to show any field-level errors
    this.usernameTouched.set(true);
    this.passwordTouched.set(true);

    if (!this.isFormValid()) {
      this.error.set(null);
      this.shakeState.set('error');
      setTimeout(() => this.shakeState.set(''), 500);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Small delay for UX feel
    setTimeout(() => {
      const result = this.authService.login(this.username().trim(), this.password());

      if (result.success) {
        this.router.navigate(['/board']);
      } else {
        this.error.set(result.error ?? 'Login failed');
        this.shakeState.set('error');
        setTimeout(() => this.shakeState.set(''), 500);
      }

      this.isLoading.set(false);
    }, 700);
  }
  //New firebase signin code
  loginWithGoogle() {
    this.isLoading.set(true);
    this.error.set(null);

    this.firebaseAuthService
      .signInWithGoogle()
      .then((userData) => {
        if (userData?.redirecting) return;
        this.ngZone.run(() => {
          // Update currentUser signal (from AuthService)
          const user = {
            username: userData.username,
            displayName: userData.displayName,
          };
          this.authService.currentUser.set(user);
          this.authService.isLoggedIn.set(true);

          // Navigate to board
          this.router.navigate(['/board']);
        });
      })
      .catch((error) => {
        this.ngZone.run(() => {
          console.error('Login error:', error);
          this.error.set(this.getGoogleErrorMessage(error));
          this.shakeState.set('error');
          setTimeout(() => this.shakeState.set(''), 500);
          this.isLoading.set(false);
        });
      });
  }

  private getGoogleErrorMessage(error: any): string {
    const code = error?.code as string | undefined;
    switch (code) {
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Authentication.';
      case 'auth/popup-blocked':
        return 'Popup blocked by browser. Redirecting to Google sign-in...';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in attempt is already in progress.';
      default:
        return 'Google sign-in failed. Please try again.';
    }
  }
}
