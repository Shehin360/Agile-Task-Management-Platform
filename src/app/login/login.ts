import { Component, signal, inject } from '@angular/core';
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
  }

  onSubmit() {
    const username = this.username().trim();
    const password = this.password();

    if (!username || !password) {
      this.error.set('Please enter both username and password');
      this.shakeState.set('error');
      setTimeout(() => this.shakeState.set(''), 500);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Small delay for UX feel
    setTimeout(() => {
      const result = this.authService.login(username, password);

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
