import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  code: number;
  data: {
    role: string;
    token: string;
  };
  message: string;
}

export interface SignupData {
  name: string;  // Keep this as full name for frontend
  email: string;
  password: string;
  confirmpassword: string;
  number: string;
}

interface BackendSignupData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string;
  number: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private apiUrl = 'http://localhost:3000/api/v1/users'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  signup(userData: SignupData): Observable<any> {
    const names = userData.name.split(' ');
    const backendData: BackendSignupData = {
      firstname: names[0],
      lastname: names.slice(1).join(' ') || '', // Join the rest as lastname, or empty string if no lastname
      email: userData.email,
      password: userData.password,
      confirmpassword: userData.confirmpassword,
      number: userData.number
    };

    return this.http.post(`${this.apiUrl}/register`, backendData);
  }

  setToken(token: string): void {
    console.log('Setting token:', token); // Debug log
    if (token === undefined) {
      console.error('Attempted to set undefined token');
      return;
    }
    localStorage.setItem('jwt_token', token);
    console.log('Token set in localStorage:', localStorage.getItem('jwt_token')); // Verify token was set
  }

  getToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    console.log('Retrieved token:', token); // Debug log
    return token;
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
    console.log('Token removed from localStorage'); // Debug log
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}
