import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatCardModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  private authSubscription?: Subscription;

  constructor(private auth: AuthService, private router: Router, public theme: ThemeService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Set initial state immediately
    this.isLoggedIn = this.auth.isAuthenticated();
    
    this.authSubscription = this.auth.authState$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.cdr.detectChanges(); // Force change detection
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout() {
    this.auth.logout();
    // Explicitly update the local state
    this.isLoggedIn = false;
    this.cdr.detectChanges();
  }
}
