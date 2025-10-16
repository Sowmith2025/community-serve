import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, MatToolbarModule, FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatButtonToggleModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  isSignup = false;
  name = '';
  confirmPassword = '';
  role: 'student' | 'organizer' = 'student';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.loading = true;
    this.error = '';
    try {
      if (this.isSignup) {
        if (this.password !== this.confirmPassword) {
          this.error = 'Passwords do not match';
          return;
        }
        await this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role });
        this.error = 'Registration successful! Please login.';
        this.isSignup = false;
        this.name = '';
        this.confirmPassword = '';
        this.role = 'student';
      } else {
        const { user } = await this.auth.login(this.email, this.password);
        if (user?.role === 'organizer') {
          this.router.navigateByUrl('/events');
        } else {
          this.router.navigateByUrl('/home');
        }
      }
    } catch (e: any) {
      this.error = e?.response?.data?.message || (this.isSignup ? 'Registration failed' : 'Login failed');
    } finally {
      this.loading = false;
    }
  }

  navigateToHome() {
    // Force navigation to home page and let the home component handle the auth state
    this.router.navigateByUrl('/home');
  }
}