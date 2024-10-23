// wishlist.component.ts
import { Component, OnInit } from '@angular/core';
// import { WishlistService } from 'src/services/cart-service/cart-service.service';
import { CartServiceService } from 'src/services/cart-service/cart-service.service';
import { UserServiceService } from 'src/services/user-service/user-service.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  isLoading = false;
  errorMessage = '';
  // router: any;

  constructor(
    private cartService: CartServiceService,
    private userService: UserServiceService,
    private router:Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.cartService.getWishlist().subscribe({
      next: (response) => {
        this.wishlistItems = response.data.books || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.errorMessage = 'Failed to load wishlist. Please try again.';
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(bookId: string): void {
    this.cartService.toggleWishlist({ _id: bookId });
    this.loadWishlist();
  }

  addToCart(book: any): void {
    this.cartService.addToCart(book);
    // Optionally remove from wishlist after adding to cart
    // this.removeFromWishlist(book._id);
  }

  isInCart(bookId: string): boolean {
    return this.cartService.isInCart(bookId);
  }
}