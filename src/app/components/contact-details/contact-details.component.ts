import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';  // Import ActivatedRoute to get route parameters
import { CustomerService } from 'src/services/customer/customer.service';
import { ICustomer } from 'src/interfaces/customer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent {

  customer: ICustomer | null = null; // Holds customer data
  errorMessage: string = ''; // Holds any error messages
  customerId: string = ''; // Holds customer ID from route

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute, // Inject ActivatedRoute to access the route params
    private router:Router
  ) { }

  ngOnInit(): void {
    // Get the customer ID from the route parameter
    this.route.paramMap.subscribe(params => {
      this.customerId = params.get('id') || '';  // Get the 'id' parameter from the route
      if (this.customerId) {
        this.loadCustomerDetails(this.customerId); // Load the customer details using the ID
      }
    });
  }

  // Function to load customer details
  loadCustomerDetails(id: string): void {
    this.customerService.getCustomerDetails(id).subscribe({
      next: (customerData) => {
        this.customer = customerData;
      },
      error: (err) => {
        this.errorMessage = 'Customer not found or error loading data.';
      }
    });
  }

  // Function to add a new customer (you can wire this to a form)
  /*
  addCustomer(newCustomer: ICustomer): void {
    this.customerService.addCustomer(newCustomer).subscribe({
      next: (customerData) => {
        this.customer = customerData; // Optionally load the new customer
      },
      error: (err) => {
        this.errorMessage = 'Error adding customer.';
      }
    });
  }
    */

  continue(){
    this.router.navigate(['/order']);
    console.log("navigated to order summary")
  }
}
