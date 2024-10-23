import { Component,OnInit } from '@angular/core';
import {CartServiceService} from 'src/services/cart-service/cart-service.service'
import { UserServiceService } from 'src/services/user-service/user-service.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoginRegisterComponent } from 'src/app/components/login-register/login-register.component';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit{
  cartItems:any[] = [];
  isLoading: boolean = false;
  private dialogRef: MatDialogRef<LoginRegisterComponent> | null = null;
  errorMessage: string = '';

  constructor(private cartService:CartServiceService,private userService:UserServiceService,private dialog: MatDialog,private router: Router){

  }

  ngOnInit(): void {
    // this.cartItems = [...this.cartService.getCart()];
    this.loadCart();
  }

  loadCart(): void {
    if (this.userService.getToken()) {
      // If user is logged in, get cart from backend
      this.isLoading = true;
      this.cartService.getBackendCart().subscribe({
        next: (backendCart) => {
          this.cartItems = backendCart;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.errorMessage = 'Failed to load cart';
          this.isLoading = false;
        }
      });
    } else {
      // If user is not logged in, get cart from localStorage
      this.cartItems = this.cartService.getLocalCart();
      console.log("local cart",this.cartItems)
    }
  }

  private syncCartsAndUpdate(localCart: any[]): void {  ///////////////////////
    this.cartService.syncBackendCartWithLocal().subscribe({
      next: () => {
        // After syncing to backend, reload the final state
        this.cartService.getBackendCart().subscribe({
          next: (finalBackendCart) => {
            this.cartService.syncLocalCartWithBackend(finalBackendCart);
            this.cartItems = [...this.cartService.getCart()];
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading final cart state:', error);
            this.errorMessage = 'Failed to load final cart state. Please refresh the page.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error syncing carts:', error);
        this.errorMessage = 'Failed to sync cart. Please try again.';
        this.isLoading = false;
      }
    });
  }



  
  

  
  

  removeItem(bookId: string): void {
    if (this.userService.getToken()) {
      this.isLoading = true;
      this.cartService.removeFromBackendCart(bookId).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error) => {
          console.error('Error removing item:', error);
          this.errorMessage = 'Failed to remove item';
          this.isLoading = false;
        }
      });
    } else {
      this.cartService.removeFromCart(bookId);
      this.loadCart();
    }
  }


  updateQuantity(item: any, newQuantity: number): void {
    if (newQuantity < 1) return;

    if (this.userService.getToken()) {
      this.isLoading = true;
      this.cartService.updateBackendCartItemQuantity(item._id, newQuantity).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.errorMessage = 'Failed to update quantity';
          this.isLoading = false;
        }
      });
    } else {
      this.cartService.updateLocalCartItem(item._id, newQuantity);
      this.loadCart();
    }
  }
  increaseQuantity(item: any) {
    if (this.userService.getToken()) {
      this.cartService.updateBackendCartItemQuantity(item._id, item.quantity + 1).subscribe(
        () => {
          this.loadCart();
        },
        error => {
          console.error('Error increasing quantity:', error);
          this.errorMessage = 'Failed to update quantity. Please try again.';
        }
      );
    } else {
      this.cartService.updateLocalCartItem(item._id, item.quantity + 1);
      this.cartItems = [...this.cartService.getCart()];
    }
}

decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      if (this.userService.getToken()) {
        this.cartService.updateBackendCartItemQuantity(item._id, item.quantity - 1).subscribe(
          () => {
            this.loadCart();
          },
          error => {
            console.error('Error decreasing quantity:', error);
            this.errorMessage = 'Failed to update quantity. Please try again.';
          }
        );
      } else {
        this.cartService.updateLocalCartItem(item._id, item.quantity - 1);
        this.cartItems = [...this.cartService.getCart()];
      }
    }
}
  

placeOrder(): void {
  if (!this.userService.getToken()) {
    this.openLoginDialog();
    return;
  }

  this.router.navigate(['/contact']);
}

private openLoginDialog(): void {
  const dialogRef = this.dialog.open(LoginRegisterComponent, {
    width: '400px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'success') {
      this.isLoading = true;
      
      // Sync local cart to backend after successful login
      this.cartService.syncLocalCartToBackend().pipe(
        finalize(() => {
          this.isLoading = false;
          this.loadCart();
          this.router.navigate(['/contact']);
        })
      ).subscribe({
        error: (error) => {
          console.error('Error syncing cart:', error);
          this.errorMessage = 'Failed to sync cart';
        }
      });
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