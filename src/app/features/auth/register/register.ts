import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MaterialModule } from '../../../shared/material/material-module';
import { AuthService } from '../../../services/auth';
import { NotificationService } from '../../../core/services/notification.service';
import { UserRole } from '../../../shared/models/user.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  public showPassword = signal(false);
  public showConfirmPassword = signal(false);
  public loading = signal(false);
  public selectedRole = signal<'renter' | 'leaser'>('renter');

  public registerForm: FormGroup = this.fb.group(
    {
      role: ['renter', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      companyName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue],
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['role'] === 'leaser') {
        this.selectRole('leaser');
      } else {
        this.selectRole('renter');
      }
    });
  }

  public selectRole(role: 'renter' | 'leaser'): void {
    this.selectedRole.set(role);
    this.registerForm.patchValue({ role });
  }

  public toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  public toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  // Getters for form controls
  public get f() {
    return this.registerForm.controls;
  }

  public get passwordMismatch(): boolean {
    return (
      this.registerForm.hasError('passwordMismatch') &&
      (this.registerForm.get('confirmPassword')?.touched || false)
    );
  }

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.notificationService.warning('Please fix the errors in the form before submitting.', 'Validation Error');
      return;
    }

    this.loading.set(true);
    const formValue = this.registerForm.value;

    this.auth
      .register({
        name: formValue.name,
        email: formValue.email,
        phone: `+91 ${formValue.phone}`,
        companyName: formValue.companyName,
        password: formValue.password,
        role: formValue.role,
      })
      .subscribe({
        next: (newUser) => {
          this.loading.set(false);
          this.notificationService.success(
            `Account created successfully for ${newUser.name}! Welcome to RentSphere.`,
            'Registration Successful'
          );

          if (newUser.role === 'leaser') {
            this.router.navigate(['/dashboard/leaser']);
          } else {
            this.router.navigate(['/dashboard/renter']);
          }
        },
        error: () => {
          this.loading.set(false);
          this.notificationService.error('Failed to create account. Please try again.', 'Registration Error');
        },
      });
  }
}
