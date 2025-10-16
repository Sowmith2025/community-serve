import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loading = false;
  error = '';
  registered: any[] = [];
  attended: any[] = [];
  totalRegistered = 0;
  totalAttended = 0;
  participationRate = 0; // 0-100

  get maxParticipationCount() {
    return Math.max(this.totalRegistered || 0, this.totalAttended || 0, 1);
  }

  // Monthly line chart state
  monthLabels: string[] = [];
  monthlyRegisteredCounts: number[] = [];
  monthlyAttendedCounts: number[] = [];
  monthlyMaxCount = 1;
  linePointsRegistered = '';
  linePointsAttended = '';
  private chartWidth = 560;
  private chartHeight = 180;
  private chartPadX = 32;
  private chartPadY = 16;

  constructor(private users: UsersService, private auth: AuthService, private eventsService: EventsService, public theme: ThemeService, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.loading = true;
    try {
      const res = await this.users.getProfile(user.id);
      this.registered = res.data.data?.registeredEvents || res.data.registeredEvents || [];

      // Only consider attended events that the user registered for
      const registeredIds = new Set((this.registered || []).map((e: any) => e.id));
      const eventMap: Record<string, any> = {};
      for (const e of this.registered) {
        if (e && e.id) eventMap[e.id] = e;
      }

      this.attended = (res.data.data?.attendance || res.data.attendance || [])
        .filter((a: any) => registeredIds.has(a.eventId))
        .map((a: any) => ({
          ...a,
          event: eventMap[a.eventId]
        }));
      
      // Metrics
      this.totalRegistered = (this.registered || []).length;
      this.totalAttended = (this.attended || []).length;
      this.participationRate = this.totalRegistered > 0 ? Math.round((this.totalAttended / this.totalRegistered) * 100) : 0;

      // Monthly aggregates (last 6 months including current)
      this.computeMonthlySeries();
        
      // Debug logging
      console.log('Dashboard - Registered events:', this.registered);
      console.log('Dashboard - Attended events:', this.attended);
      console.log('Dashboard - Metrics:', { totalRegistered: this.totalRegistered, totalAttended: this.totalAttended, participationRate: this.participationRate + '%'});
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to load dashboard';
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }

  private computeMonthlySeries() {
    const now = new Date();
    const monthKeys: string[] = [];
    const formatKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const labelFor = (d: Date) => d.toLocaleString(undefined, { month: 'short' });

    // Build last 6 months keys from oldest to newest
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
      monthKeys.push(formatKey(d));
    }

    const regCounts: Record<string, number> = Object.fromEntries(monthKeys.map(k => [k, 0]));
    const attCounts: Record<string, number> = Object.fromEntries(monthKeys.map(k => [k, 0]));

    // Registered: use event date if available, else createdAt
    for (const e of this.registered) {
      const dateStr = e?.date || e?.createdAt;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      const key = formatKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in regCounts) regCounts[key]++;
    }

    // Attended: prefer checkInTime
    for (const a of this.attended) {
      const dateStr = a?.checkInTime || a?.checkOutTime;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      const key = formatKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (key in attCounts) attCounts[key]++;
    }

    this.monthLabels = months.map(labelFor);
    this.monthlyRegisteredCounts = monthKeys.map(k => regCounts[k] || 0);
    this.monthlyAttendedCounts = monthKeys.map(k => attCounts[k] || 0);
    this.monthlyMaxCount = Math.max(1, ...this.monthlyRegisteredCounts, ...this.monthlyAttendedCounts);

    this.computeLinePoints();
  }

  private computeLinePoints() {
    const cw = this.chartWidth - this.chartPadX * 2;
    const ch = this.chartHeight - this.chartPadY * 2;
    const n = this.monthLabels.length;
    if (n <= 1) {
      this.linePointsRegistered = '';
      this.linePointsAttended = '';
      return;
    }
    const stepX = cw / (n - 1);
    const yFor = (value: number) => this.chartPadY + (ch - (value / this.monthlyMaxCount) * ch);

    const pointsReg: string[] = [];
    const pointsAtt: string[] = [];
    for (let i = 0; i < n; i++) {
      const x = this.chartPadX + stepX * i;
      const yR = yFor(this.monthlyRegisteredCounts[i] || 0);
      const yA = yFor(this.monthlyAttendedCounts[i] || 0);
      pointsReg.push(`${x},${yR}`);
      pointsAtt.push(`${x},${yA}`);
    }
    this.linePointsRegistered = pointsReg.join(' ');
    this.linePointsAttended = pointsAtt.join(' ');
  }
}
