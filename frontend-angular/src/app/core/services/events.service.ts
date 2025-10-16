import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.client.get('/events');
  }

  getById(id: string) {
    return this.api.client.get(`/events/${id}`);
  }

  register(eventId: string, userId: string) {
    return this.api.client.post(`/events/${eventId}/register`, { userId });
  }

  create(eventData: any) {
    return this.api.client.post('/events', eventData);
  }
}