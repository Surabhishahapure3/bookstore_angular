import { Component,OnInit } from '@angular/core';
import {CartServiceService} from 'src/services/cart-service/cart-service.service'
import { UserServiceService } from 'src/services/user-service/user-service.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginRegisterComponent } from 'src/app/components/login-register/login-register.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit{
  cartItems:any[] = [];
  private dialogRef: MatDialogRef<LoginRegisterComponent> | null = null;
  errorMessage: string = '';

  constructor(private cartService:CartServiceService,private userService:UserServiceService,private dialog: MatDialog,private router: Router){

  }

  ngOnInit(): void {
    this.cartItems = [...this.cartService.getCart()];
    this.loadCart();
  }

  loadCart(): void {
  const localCart = this.cartService.getCart();

  if (this.userService.getToken()) {
    this.cartService.getBackendCart().subscribe(
      backendCart => {
        // Merge backend and local cart items directly using the spread operator
        this.cartItems = backendCart.map(backendItem => {
          const localItem = localCart.find(item => item._id === backendItem._id);

          // If localItem exists, merge the quantities, otherwise return backendItem
          return localItem ? { ...backendItem, quantity: backendItem.quantity + localItem.quantity } : backendItem;
        });

        // Add items from local cart that are not present in backend cart
        const itemsOnlyInLocalCart = localCart.filter(
          localItem => !backendCart.some(backendItem => backendItem._id === localItem._id)
        );
        
        // Spread the local-only items into the cart
        this.cartItems = [...this.cartItems, ...itemsOnlyInLocalCart];

        // Display merged cart in console
        console.log('Merged Cart:', this.cartItems);
      },
      error => console.error('Error fetching cart:', error)
    );
  } else {
    // If no token, just use the local cart
    this.cartItems = localCart;
    console.log('Local Cart:', this.cartItems);
  }
}

  
  

  removeItem(bookId: string) {
    if (this.userService.getToken()) {
      this.cartService.removeFromBackendCart(bookId).subscribe(
        () => {
          this.loadCart(); // Reload the cart from the backend
        },
        error => {
          console.error('Error removing item from cart:', error);
          this.errorMessage = 'Failed to remove item. Please try again.';
        }
      );
    } else {
      this.cartService.removeFromCart(bookId);
      this.cartItems = [...this.cartService.getCart()];
    }
  }


  updateQuantity(item: any, newQuantity: number) {
    if (newQuantity < 1) return;

    if (this.userService.getToken()) {
      this.cartService.updateBackendCartItemQuantity(item._id, newQuantity).subscribe(
        () => {
          this.loadCart(); // Reload the cart from the backend
        },
        error => {
          console.error('Error updating quantity:', error);
          this.errorMessage = 'Failed to update quantity. Please try again.';
        }
      );
    } else {
      item.quantity = newQuantity;
      this.cartService.addToCart(item, 0); // Update local cart
      this.cartItems = this.cartService.getCart();
    }
  }


  increaseQuantity(item: any) {
    if (this.userService.getToken()) {
      this.cartService.updateBackendCartItemQuantity(item._id, item.quantity + 1).subscribe(
        () => {
          this.loadCart(); // Reload the cart from the backend
        },
        error => {
          console.error('Error increasing quantity:', error);
          this.errorMessage = 'Failed to update quantity. Please try again.';
        }
      );
    } else {
      item.quantity++;
      this.cartService.addToCart(item, 0);
      this.cartItems = [...this.cartService.getCart()];
    }
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      if (this.userService.getToken()) {
        this.cartService.updateBackendCartItemQuantity(item._id, item.quantity - 1).subscribe(
          () => {
            this.loadCart(); // Reload the cart from the backend
          },
          error => {
            console.error('Error decreasing quantity:', error);
            this.errorMessage = 'Failed to update quantity. Please try again.';
          }
        );
      } else {
        item.quantity--;
        this.cartService.addToCart(item, 0);
        this.cartItems = [...this.cartService.getCart()];
      }
    }
  }
  

  placeOrder(): void {
    if (this.userService.getToken()) {
      // User is logged in, proceed with order placement
      console.log('Placing order...');
      // Implement order placement logic here
    } else {
      // User is not logged in, open login/register dialog
      this.openLoginRegisterDialog();
    }
  }

  openLoginRegisterDialog(): void {
    const dialogRef = this.dialog.open(LoginRegisterComponent, {
      width: '400px',
      disableClose: true // Prevents closing the dialog by clicking outside
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        
        console.log('Login successful, proceeding with order placement');
        this.loadCart();
        this.router.navigate(['/contact']);
      } else {
        console.log('Login cancelled or failed');
        // Optionally, you can show a message to the user here
      }
    });
  }


  proceedWithOrderPlacement(): void {
    // Implement your order placement logic here
    console.log('Placing order...');
    // For example:
    // this.orderService.placeOrder(this.cartItems).subscribe(
    //   response => {
    //     console.log('Order placed successfully', response);
    //     // Navigate to order confirmation page or show success message
    //   },
    //   error => {
    //     console.error('Error placing order', error);
    //     // Show error message to user
    //   }
    // );
  }

  closeLoginDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }


}
