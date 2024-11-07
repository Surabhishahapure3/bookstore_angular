import { Component } from '@angular/core';
import {Router} from '@angular/router';
import { CartServiceService } from 'src/services/cart-service/cart-service.service';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss']
})
export class OrderSummaryComponent {
  orderDetails: any;  // To store the order details

  constructor(private router: Router,private cartService:CartServiceService) { }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders():void{
    this.cartService.getAllOrders().subscribe(
      (response:any)=>{
        this.orderDetails = response
      },
      (error)=>{
        console.error("Error fetching order",error)
      }
    )
  }
}


