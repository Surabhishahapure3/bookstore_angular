import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './components/Book/book.component';
import { HeaderComponent } from './components/header.component';
import { BookdetailsComponent } from './components/Bookdetails/bookdetails.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { OrderComponent } from './components/order/order.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';

const routes: Routes = [
  {
    path:'home',
    component:HeaderComponent
  },
  {
    path:'book',
    component:BookComponent
  },
  {
    path:'book/:bookId',
    component:BookdetailsComponent
  },
  {
    path:'cart',
    component:CartComponent
  },
  {
    path:'loginSignUp',
    component:LoginRegisterComponent
  },
  {
    path:'contact',
    component:ContactDetailsComponent
  },
  {
    path:'order',
    component:OrderComponent
  },
  {
    path:'wishlist',
    component:WishlistComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
