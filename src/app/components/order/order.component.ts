import { Component, OnInit } from '@angular/core';
import { CartServiceService } from 'src/services/cart-service/cart-service.service';
import { Router } from '@angular/router';
import { UserServiceService } from 'src/services/user-service/user-service.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderItems: any[] = [];
  totalPrice: number = 0;
  totalDiscountPrice: number = 0;
  errorMessage: string | undefined;
  isLoggedIn: boolean = false;

  constructor(
    private cartService: CartServiceService,
    private userService: UserServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.getCartItems();
  }

  checkLoginStatus(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  getCartItems(): void {
    this.cartService.getBackendCart().subscribe(
      (cartItems) => {
        this.orderItems = cartItems;
        this.calculateTotals();
      },
      (error) => {
        console.error('Error fetching cart items:', error);
        this.errorMessage = 'Unable to fetch cart items. Please try again later.';
        // this.orderItems = [];
        this.calculateTotals();
      }
    );
  }

  calculateTotals(): void {
    this.totalPrice = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.totalDiscountPrice = this.orderItems.reduce((total, item) => total + (item.discountPrice * item.quantity), 0);
  }

  orderResponse: any;  // Define a variable to store the order response

checkout(): void {
  if (!this.isLoggedIn) {
    this.router.navigate(['/login']);
    return;
  }

  const token = this.userService.getToken();
  if (!token) {
    this.router.navigate(['/login']);
    this.errorMessage = 'You need to be logged in to place an order.';
    return;
  }

  // Call the createOrder method from cartService and store the response
  this.cartService.createOrder().subscribe(
    (response) => {
      this.orderResponse = response; // Store the response in a variable
      console.log("Order has been placed:", this.orderResponse);

      
     
    },
    (error) => {
      console.error("Error placing order:", error);
      this.errorMessage = 'Error placing order. Please try again.';
    }
  );
}

    
}
