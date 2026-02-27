import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
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
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  displayName = signal('');
  username = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal<string | null>(null);
  isLoading = signal(false);
  shakeState = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // ──────── TOUCHED STATE ────────
  displayNameTouched = signal(false);
  usernameTouched = signal(false);
  passwordTouched = signal(false);
  confirmPasswordTouched = signal(false);

  // ──────── FIELD VALIDATION ────────
  displayNameError = computed(() => {
    if (!this.displayNameTouched()) return null;
    const val = this.displayName().trim();
    if (!val) return 'Display name is required';
    if (val.length < 2) return 'Display name must be at least 2 characters';
    return null;
  });

  usernameError = computed(() => {
    if (!this.usernameTouched()) return null;
    const val = this.username().trim();
    if (!val) return 'Username is required';
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (/[^a-zA-Z0-9_]/.test(val))
      return 'Only letters, numbers & underscores allowed';
    if (this.authService.isUsernameTaken(val))
      return 'This username is already taken';
    return null;
  });

  passwordError = computed(() => {
    if (!this.passwordTouched()) return null;
    const val = this.password();
    if (!val) return 'Password is required';
    if (val.length < 4) return 'Password must be at least 4 characters';
    return null;
  });

  confirmPasswordError = computed(() => {
    if (!this.confirmPasswordTouched()) return null;
    const val = this.confirmPassword();
    if (!val) return 'Please confirm your password';
    if (val !== this.password()) return 'Passwords do not match';
    return null;
  });

  isFormValid = computed(() => {
    const d = this.displayName().trim();
    const u = this.username().trim();
    const p = this.password();
    const cp = this.confirmPassword();
    return (
      d.length >= 2 &&
      u.length >= 3 &&
      !/[^a-zA-Z0-9_]/.test(u) &&
      !this.authService.isUsernameTaken(u) &&
      p.length >= 4 &&
      p === cp
    );
  });

  // ──────── INPUT HANDLERS ────────
  onDisplayNameInput(value: string) {
    this.displayName.set(value);
    if (this.error()) this.error.set(null);
  }

  onUsernameInput(value: string) {
    this.username.set(value);
    if (this.error()) this.error.set(null);
  }

  onPasswordInput(value: string) {
    this.password.set(value);
    if (this.error()) this.error.set(null);
  }

  onConfirmPasswordInput(value: string) {
    this.confirmPassword.set(value);
    if (this.error()) this.error.set(null);
  }

  onDisplayNameBlur() {
    this.displayNameTouched.set(true);
  }
  onUsernameBlur() {
    this.usernameTouched.set(true);
  }
  onPasswordBlur() {
    this.passwordTouched.set(true);
  }
  onConfirmPasswordBlur() {
    this.confirmPasswordTouched.set(true);
  }

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/board']);
    }
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit() {
    this.displayNameTouched.set(true);
    this.usernameTouched.set(true);
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);

    if (!this.isFormValid()) {
      this.error.set(null);
      this.shakeState.set('error');
      setTimeout(() => this.shakeState.set(''), 500);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    setTimeout(() => {
      const result = this.authService.register(
        this.username().trim(),
        this.password(),
        this.displayName().trim()
      );

      if (result.success) {
        this.router.navigate(['/board']);
      } else {
        this.error.set(result.error ?? 'Registration failed');
        this.shakeState.set('error');
        setTimeout(() => this.shakeState.set(''), 500);
      }

      this.isLoading.set(false);
    }, 700);
  }
}
