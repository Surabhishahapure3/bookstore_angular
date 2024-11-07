import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, BehaviorSubject} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { UserServiceService } from '../user-service/user-service.service';

@Injectable({
  providedIn: 'root'
})
export class CartServiceService {
  private cart: any[] = [];
  private wishlist: any[] = [];
  private wishlistItems: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();
  private readonly CART_STORAGE_KEY = 'localCart';
  private baseUrl = 'http://localhost:3000/api/v1/wishlist';
  private apiUrl = 'http://localhost:3000/api/v1/cart/';
  private Url = 'http://localhost:3000/api/v1/orders';

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

  

  createOrder(): Observable<any> {
    return this.http.post<any>(`${this.Url}/`, {}, { headers: this.getHeaders() });
  }

  getAllOrders(): Observable<any> {
    return this.http.get<any>(`${this.Url}/`, { headers: this.getHeaders() });
  }

  updateBackendCart(bookId: string, quantity: number):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/updatequantity`,{bookId,quantity},{headers:this.getHeaders()})
  }

  addToCart(book: any, quantity: number = 1): void {
    const currentCart = this.getLocalCart();
    const existingItem = currentCart.find(item => item._id === book._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push({ ...book, quantity });
    }

    this.saveCartToStorage(currentCart);
  }

  removeFromCart(bookId: string): void {
    const currentCart = this.getLocalCart();
    const updatedCart = currentCart.filter(item => item._id !== bookId);
    this.saveCartToStorage(updatedCart);
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

  getWishlist(): Observable<any> {
    if (!this.userService.getToken()) {
      return of({ data: { books: [] } });
    }
    
    return this.http.get(`${this.baseUrl}`, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        this.wishlistItems = response.data.books || [];
      }),
      catchError(this.handleError('getWishlist', { data: { books: [] } }))
    );
  }

  getCartQuantity(bookId: string): number | null {
    const bookInCart = this.cart.find(item => item._id === bookId);
    return bookInCart ? bookInCart.quantity : null;
  }

  getBackendCart(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() }).pipe(
      map(response => response?.data?.books || []),
      catchError(error => {
        console.error('Error fetching backend cart:', error);
        return of([]);
      })
    );
  }

  private addToBackendCart(book: any, quantity: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${book._id}`, 
      { quantity }, 
      { headers: this.getHeaders() }
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
    return this.http.post(
      `${this.apiUrl}/updatequantity`, 
      { bookId, quantity }, 
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        // Don't update local cart here - let the loadCart handle it
        console.log('Backend quantity updated:', response);
      }),
      catchError(this.handleError<any>('updateBackendCartItemQuantity'))
    );
}

syncLocalCartWithBackend(backendCart: any[]): void {
  console.log('Syncing backend cart to local:', backendCart);
  
  // Create a map of items by ID for easier lookup
  const itemMap = new Map();
  
  // Process backend items first
  backendCart.forEach(backendItem => {
    itemMap.set(backendItem._id, { ...backendItem });
  });
  
  // Process local items, combining quantities if item exists in backend
  this.cart.forEach(localItem => {
    if (itemMap.has(localItem._id)) {
      // If item exists in both carts, add quantities
      const existingItem = itemMap.get(localItem._id);
      existingItem.quantity += localItem.quantity;
      itemMap.set(localItem._id, existingItem);
    } else {
      // If item only exists locally, add it to the map
      itemMap.set(localItem._id, { ...localItem });
    }
  });
  
  // Convert map back to array
  this.cart = Array.from(itemMap.values());
  console.log('Final merged cart:', this.cart);
}


syncBackendCartWithLocal(): Observable<any> {
  const localCart = this.getCart();
  console.log('Syncing local cart to backend:', localCart);

  if (localCart.length === 0) {
    return of([]);
  }

  // Create an array of observables for updating each item
  const operations = localCart.map(item => {
    return this.updateOrAddToBackendCart(item).pipe(
      catchError(error => {
        console.error(`Error syncing item ${item._id}:`, error);
        return of(null);
      })
    );
  });

  return forkJoin(operations).pipe(
    tap(() => console.log('Cart sync completed')),
    catchError(this.handleError<any>('syncBackendCartWithLocal'))
  );
}

private updateOrAddToBackendCart(item: any): Observable<any> {
  return this.getBackendCart().pipe(
    switchMap(backendCart => {
      const existingItem = backendCart.find((bi: any) => bi._id === item._id);
      if (existingItem) {
        // If item exists, update quantity
        return this.updateBackendCartItemQuantity(
          item._id, 
          existingItem.quantity + item.quantity
        );
      } else {
        // If item doesn't exist, add it
        return this.addToBackendCart(item, item.quantity);
      }
    })
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

  updateLocalCartItem(itemId: string, newQuantity: number) {
    // Get current cart from local storage
    const cart = this.getLocalCart();
    
    // Find and update the item
    const updatedCart = cart.map(cartItem => {
      if (cartItem._id === itemId) {
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });
  
    // Save back to local storage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  
    // Return the updated item
    return updatedCart.find(item => item._id === itemId);
  }
  


  /*-----------------------------------------------------------------------------------------------------------------------------------------------*/
  private loadCartFromStorage(): void { //////////
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        this.cartSubject.next(parsedCart);
      } catch (e) {
        console.error('Error parsing stored cart:', e);
        this.saveCartToStorage([]);
      }
    }
  }

  updateCartItemInBackend(itemId: string, quantity: number) {
    return this.http.put(`${this.apiUrl}updatequantity`, {
      itemId,
      quantity
    });
  }

  private saveCartToStorage(cart: any[]): void {/////////////////////
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  getLocalCart(): any[] {//////////////////////
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    const cart = storedCart ? JSON.parse(storedCart) : [];
    this.cartSubject.next(cart);
    return cart;
  }

  syncLocalCartToBackend(): Observable<any> {
    const localCart = this.getLocalCart();
    if (localCart.length === 0) return of(null);

    const syncOperations = localCart.map(item => 
      this.addToBackendCart(item, item.quantity).pipe(
        catchError(error => {
          console.error(`Error syncing item ${item._id}:`, error);
          return of(null);
        })
      )
    );

    return forkJoin(syncOperations).pipe(
      tap(() => {
        // Clear local storage after successful sync
        this.clearLocalCart();
      })
    );
  }

  

  clearLocalCart(): void {
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }
    
}