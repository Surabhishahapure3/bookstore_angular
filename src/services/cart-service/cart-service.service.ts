import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { UserServiceService } from '../user-service/user-service.service';

@Injectable({
  providedIn: 'root'
})
export class CartServiceService {
  private cart: any[] = [];
  private wishlist: any[] = [];
  private apiUrl = 'http://localhost:3000/api/v1/cart/';
  // books: any;
  // data:any;

  constructor(
    private http: HttpClient,
    private userService: UserServiceService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.userService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  addToCart(book: any, quantity: number = 1): void {
    const existingItem = this.cart.find((item) => item._id === book._id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({ ...book, quantity });
    }
    console.log('Cart:', this.cart);
  }

  removeFromCart(bookId: string): void {
    this.cart = this.cart.filter((item) => item._id !== bookId);
  }

  toggleWishlist(book: any): void {
    const existingItem = this.wishlist.find((item) => item._id === book._id);
    if (existingItem) {
      this.wishlist = this.wishlist.filter((item) => item._id !== book._id);
    } else {
      this.wishlist.push(book);
    }
    console.log('Wishlist:', this.wishlist);
  }

  isInCart(bookId: string): boolean {
    return this.cart.some((item) => item._id === bookId);
  }

  isInWishlist(bookId: string): boolean {
    return this.wishlist.some((item) => item._id === bookId);
  }

  getCart(): any[] {
    return this.cart;
  }

  getWishlist(): any[] {
    return this.wishlist;
  }

  getCartQuantity(bookId: string): number | null {
    const bookInCart = this.cart.find(item => item._id === bookId);
    return bookInCart ? bookInCart.quantity : null;
  }

  getBackendCart(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Backend Cart data:', response);
        this.syncLocalCartWithBackend(response.data.books || []);
      }),
      map(response => response.data.books || []), 
      catchError(this.handleError<any[]>('getBackendCart', []))
    );
  }

  addToBackendCart(book: any, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}${book._id}`, {}, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Book added to backend cart:', response);
        this.addToCart(book, quantity);
      }),
      catchError(this.handleError<any>('addToBackendCart'))
    );
  }

  removeFromBackendCart(bookId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${bookId}`, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Book removed from backend cart:', response);
        this.removeFromCart(bookId);
      }),
      catchError(this.handleError<any>('removeFromBackendCart'))
    );
  }

  updateBackendCartItemQuantity(bookId: string, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/updatequantity`, { bookId, quantity }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Cart item quantity updated:', response);
        const item = this.cart.find(i => i._id === bookId);
        if (item) {
          item.quantity = quantity;
        }
      }),
      catchError(this.handleError<any>('updateBackendCartItemQuantity'))
    );
  }

  syncLocalCartWithBackend(backendCart: any[]): void {
    // Clear the local cart
    this.cart = [];

    // Add all items from the backend cart to the local cart
    backendCart.forEach(item => {
      this.addToCart(item, item.quantity);
    });

    console.log('Local cart synced with backend:', this.cart);
  }

  syncBackendCartWithLocal(): Observable<any> {
    // First, clear the backend cart
    return this.http.delete(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      tap(() => console.log('Backend cart cleared')),
      // Then, add all items from the local cart to the backend
      switchMap(() => {
        const addOperations = this.cart.map(item => 
          this.addToBackendCart(item, item.quantity)
        );
        return forkJoin(addOperations);
      }),
      catchError(this.handleError<any>('syncBackendCartWithLocal'))
    );
  }

  private mergeBackendCart(backendCart: any[]): void {
    if (!Array.isArray(backendCart)) {
      console.error('Backend cart is not an array:', backendCart);
      return;
    }
    
    backendCart.forEach(backendItem => {
      const localItem = this.cart.find(item => item._id === backendItem._id);
      if (localItem) {
        localItem.quantity = Math.max(localItem.quantity, backendItem.quantity);
      } else {
        this.cart.push(backendItem);
      }
    });
    console.log('Merged Cart:', this.cart);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
    
}