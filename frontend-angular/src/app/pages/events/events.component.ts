import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventsService } from '../../core/services/events.service';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  loading = false;
  error = '';
  registering: Record<string, boolean> = {};
  registeredSet: Set<string> = new Set();
  isOrganizer = false;
  creating = false;
  newEvent: any = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxVolunteers: 20,
    category: 'general'
  };

  constructor(private eventsService: EventsService, private auth: AuthService, private usersService: UsersService, public theme: ThemeService, private router: Router) {}

  async ngOnInit() {
    this.loading = true;
    this.error = '';
    
    try {
      console.log('Fetching events...');
      console.log('API Base URL:', 'http://localhost:5000/api');
      
      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const res = await this.eventsService.getAll();
      console.log('Events response:', res);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from events API');
      }
      
      this.events = res.data.data || res.data;
      console.log('Events loaded successfully:', this.events.length);
      
      const user = this.auth.getCurrentUser();
      if (user) {
        console.log('Fetching user profile...');
        const prof = await this.usersService.getProfile(user.id);
        console.log('Profile response:', prof);
        const regs = prof.data.data?.registeredEvents || prof.data.registeredEvents || [];
        this.registeredSet = new Set(regs.map((e: any) => e.id));
        this.isOrganizer = user.role === 'organizer';
        
        // Debug logging
        console.log('Registered events:', regs);
        console.log('Registered set:', this.registeredSet);
        console.log('Events:', this.events.map(e => ({ id: e.id, title: e.title })));
      }
    } catch (e: any) {
      console.error('Error loading events:', e);
      console.error('Error details:', {
        message: e.message,
        response: e.response,
        status: e.response?.status,
        statusText: e.response?.statusText
      });
      
      if (e.code === 'ECONNREFUSED' || e.message?.includes('Network Error')) {
        this.error = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000';
      } else if (e.response?.status === 404) {
        this.error = 'Events API not found. Please check the backend routes.';
      } else if (e.response?.status >= 500) {
        this.error = 'Server error. Please check the backend logs.';
      } else {
        this.error = e?.response?.data?.message || e?.message || 'Failed to load events';
      }
    } finally {
      this.loading = false;
    }
  }

  async register(eventId: string) {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.error = 'Please log in to register';
      return;
    }
    this.registering[eventId] = true;
    try {
      await this.eventsService.register(eventId, user.id);
      // Optimistic update: mark as registeredCount+1
      this.events = this.events.map(e => e.id === eventId ? { ...e, registeredCount: (e.registeredCount||0)+1 } : e);
      this.registeredSet.add(eventId);
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Registration failed';
    } finally {
      this.registering[eventId] = false;
    }
  }

  async createEvent() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'organizer') {
      this.error = 'Only organizers can create events';
      return;
    }
    this.creating = true;
    this.error = '';
    try {
      const payload = { ...this.newEvent, organizerId: user.id };
      const res = await this.eventsService.create(payload);
      this.events = [res.data.event, ...this.events];
      this.newEvent = { title: '', description: '', date: '', time: '', location: '', maxVolunteers: 20, category: 'general' };
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to create event';
    } finally {
      this.creating = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}