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
        this.orderItems = [];
        this.calculateTotals();
      }
    );
  }

  calculateTotals(): void {
    this.totalPrice = this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.totalDiscountPrice = this.orderItems.reduce((total, item) => total + (item.discountPrice * item.quantity), 0);
  }

  checkout(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.createOrder().subscribe(
      (response) => {
        if (response.code === 201) {
          console.log('Order created successfully:', response.data);
          this.cartService.getAllOrders().subscribe(
            (orderResponse) => {
              if (orderResponse.code === 200) {
                this.orderItems = orderResponse.data;
                this.calculateTotals();
                // Clear the cart after successful order creation
                this.cartService.syncLocalCartWithBackend([]);
                // Navigate to a confirmation page or the next step in your checkout process
                this.router.navigate(['/order-confirmation']);
              }
            },
            (error) => {
              console.error('Error fetching orders:', error);
              this.errorMessage = 'Error fetching order details. Please try again.';
            }
          );
        }
      },
      (error) => {
        console.error('Error creating order:', error);
        this.errorMessage = 'Error creating order. Please try again.';
      }
    );
  }
}