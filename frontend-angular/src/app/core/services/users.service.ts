import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  getProfile(id: string) {
    return this.api.client.get(`/users/${id}`);
  }

  updateProfile(id: string, data: { name: string; phone?: string; department?: string }) {
    return this.api.client.put(`/users/${id}`, data);
  }

  getLeaderboard() {
    return this.api.client.get('/users/leaderboard/top');
  }
}