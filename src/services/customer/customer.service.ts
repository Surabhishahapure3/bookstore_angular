import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICustomer } from 'src/interfaces/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = 'http://localhost:3000/api/customers'; // Your backend API URL

  constructor(private http: HttpClient) {}

  // Fetch customer details by ID
  getCustomerDetails(customerId: string): Observable<ICustomer> {
    return this.http.get<ICustomer>(`${this.apiUrl}/${customerId}`);
  }

  // Add a new address to a customer
  addAddress(customerId: string, address: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${customerId}`, address);
  }
}