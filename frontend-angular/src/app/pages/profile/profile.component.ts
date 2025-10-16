import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatToolbarModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, MatChipsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  name = '';
  email = '';
  role = '';
  phone = '';
  department = '';
  saving = false;
  message = '';
  hoursCompleted = 0;
  eventsAttended = 0;
  registeredCount = 0;
  registered: any[] = [];
  attendance: any[] = [];
  badges: string[] = [];

  constructor(private users: UsersService, private auth: AuthService, public theme: ThemeService, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return;
    }
    this.email = user.email;
    this.role = user.role;
    try {
      const res = await this.users.getProfile(user.id);
      const userData = res.data.data?.user || res.data.user;
      const registeredEvents = res.data.data?.registeredEvents || res.data.registeredEvents;
      const attendance = res.data.data?.attendance || res.data.attendance;
      
      this.name = userData.name;
      this.hoursCompleted = userData.hoursCompleted || 0;
      this.eventsAttended = userData.eventsAttended || 0;
      this.registeredCount = (registeredEvents || []).length;
      this.phone = userData.phone || '';
      this.department = userData.department || '';
      this.registered = registeredEvents || [];
      
      // Map attendance records to include event information
      const registeredIds = new Set((this.registered || []).map((e: any) => e.id));
      const eventMap: Record<string, any> = {};
      for (const e of this.registered) {
        if (e && e.id) eventMap[e.id] = e;
      }

      this.attendance = (attendance || [])
        .filter((a: any) => registeredIds.has(a.eventId))
        .map((a: any) => ({
          ...a,
          event: eventMap[a.eventId]
        }));
      
      this.computeBadges();
    } catch {}
  }

  computeBadges() {
    const badges: string[] = [];
    if (this.eventsAttended >= 1) badges.push('First Event');
    if (this.hoursCompleted >= 10) badges.push('10 Hours');
    if (this.hoursCompleted >= 25) badges.push('25 Hours');
    if (this.registeredCount >= 5) badges.push('Active Volunteer');
    this.badges = badges;
  }

  async save() {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.saving = true;
    this.message = '';
    try {
      await this.users.updateProfile(user.id, { name: this.name, phone: this.phone, department: this.department });
      this.message = 'Saved!';
      // also update cached user name
      localStorage.setItem('user', JSON.stringify({ ...user, name: this.name, phone: this.phone, department: this.department }));
    } catch (e: any) {
      this.message = e?.response?.data?.message || 'Save failed';
    } finally {
      this.saving = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}
