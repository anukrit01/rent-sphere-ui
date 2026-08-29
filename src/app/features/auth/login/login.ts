import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { AuthService, DEMO_ACCOUNTS } from '../../../services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../shared/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  public showPassword = signal(false);
  public loading = signal(false);
  public isForgotPasswordMode = signal(false);
  public forgotEmail = signal('');
  public resetSent = signal(false);

  public demoAccounts = DEMO_ACCOUNTS.filter((a) => a.user.role !== 'guest');

  public loginForm: FormGroup = this.fb.group({
    email: ['aman.sharma@buildcorp.in', [Validators.required, Validators.email]],
    password: ['Password@123', [Validators.required, Validators.minLength(6)]],
    rememberMe: [true],
  });

  public get emailControl() {
    return this.loginForm.get('email');
  }

  public get passwordControl() {
    return this.loginForm.get('password');
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.notificationService.success(`Welcome back, ${user.name}!`, 'Signed In');

        // Redirect based on role
        if (user.role === 'renter') {
          this.router.navigate(['/dashboard/renter']);
        } else if (user.role === 'leaser') {
          this.router.navigate(['/dashboard/leaser']);
        } else if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Invalid email or password. Please try again.', 'Authentication Failed');
      },
    });
  }

  public toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  public quickSignIn(role: UserRole): void {
    const demo = DEMO_ACCOUNTS.find((a) => a.user.role === role);
    if (demo) {
      this.loginForm.patchValue({
        email: demo.user.email,
        password: 'Password@123',
      });
      this.onSubmit();
    }
  }

  public sendPasswordReset(): void {
    if (!this.forgotEmail() || !this.forgotEmail().includes('@')) {
      this.notificationService.warning('Please enter a valid account email address.', 'Email Required');
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.resetSent.set(true);
      this.notificationService.success(
        `A password reset link has been dispatched to ${this.forgotEmail()}`,
        'Reset Link Sent'
      );
    }, 600);
  }
}
