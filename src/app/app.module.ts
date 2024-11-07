//modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { AppRoutingModule } from './app-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
//components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookComponent } from './components/Book/book.component';
import { BookdetailsComponent } from './components/Bookdetails/bookdetails.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { OrderComponent } from './components/order/order.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    BookComponent,
    BookdetailsComponent,
    CartComponent,
    LoginRegisterComponent,
    ContactDetailsComponent,
    OrderComponent,
    WishlistComponent,
    OrderSummaryComponent
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
