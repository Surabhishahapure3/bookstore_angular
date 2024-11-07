import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from 'src/services/book-service/book.service';
import {CartServiceService} from 'src/services/cart-service/cart-service.service'

@Component({
  selector: 'app-bookdetails',
  templateUrl: './bookdetails.component.html',
  styleUrls: ['./bookdetails.component.scss']
})
export class BookdetailsComponent implements OnInit {
  bookDetails: any;
  // cartDetails:any;
  showQuantityControl: boolean = false;
  quantityToBuy: number = 1;
  isInWishlist: boolean = false;
  isInBag: boolean = false;

  

  constructor(private route: ActivatedRoute, private bookService: BookService,private cartService:CartServiceService,private snackBar:MatSnackBar) {}

  ngOnInit(): void {
   
    const bookId = this.route.snapshot.paramMap.get('bookId');
    if (bookId) {
      this.fetchBookDetails(bookId);
    }else{
      this.isInBag = this.cartService.isInCart(this.bookDetails._id);
      this.isInWishlist = this.cartService.isInWishlist(this.bookDetails._id);
    }
  }

  fetchBookDetails(bookId: string) {
    this.bookService.getBookbyId(bookId).subscribe(
      (response: any) => {
        this.bookDetails = {...response.data};
        console.log('Book details:', this.bookDetails);
        this.isInBag = this.cartService.isInCart(this.bookDetails._id);
        this.quantityToBuy = this.cartService.getCartQuantity(this.bookDetails._id) || 1;
      },
      (error) => {
        console.error('Error fetching book details', error);
      }
    );
  }

  addToBag(): void {
    this.cartService.addToCart(this.bookDetails, this.quantityToBuy);
    this.snackBar.open('Added to Bag', 'Close', { 
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.isInBag = true;
  }

  toggleWishlist(): void {
    this.cartService.toggleWishlist(this.bookDetails);
    this.isInWishlist = this.cartService.isInWishlist(this.bookDetails._id);
  }

  decrementQuantity(): void {
    if (this.quantityToBuy > 1) {
      this.quantityToBuy--;
    }
  }

  incrementQuantity(): void {
    this.quantityToBuy++;
  }

  
}
