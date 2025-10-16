import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: `${environment.apiBaseUrl}/api`,
      headers: { 'Content-Type': 'application/json' }
    });

    this.http.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  get client() {
    return this.http;
  }
}