// src/app/components/order/order.component.ts
import { Component, OnInit } from '@angular/core';
import { CartServiceService } from 'src/services/cart-service/cart-service.service';

interface OrderItem {
  bookImage: string;
  bookName: string;
  price: number;
  discountPrice: number;
  author: string;
  quantity: number;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderItems: OrderItem[] = [];

  constructor(private cartService: CartServiceService) {}

  ngOnInit() {
    this.loadOrderItems();
  }

  loadOrderItems() {
    const cartItems = this.cartService.getCart();
    console.log("cart items",cartItems)
    this.orderItems = cartItems.map(item => ({
      bookImage: item.bookImage || '',
      bookName: item.bookName || '',
      price: item.price || 0,
      discountPrice: item.discountPrice || 0,
      author: item.author || '',
      quantity: item.quantity || 0
    }));
  }

  calculateTotal(): number {
    return this.orderItems.reduce((total, item) => 
      total + (item.discountPrice * item.quantity), 0);
  }

  checkout() {
    console.log('Proceeding to checkout');
    // Implement checkout logic here
  }
}