import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
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
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

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

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(user: string, pass: string) {
    this.username.set(user);
    this.password.set(pass);
    this.error.set(null);
    this.usernameTouched.set(false);
    this.passwordTouched.set(false);
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
}
