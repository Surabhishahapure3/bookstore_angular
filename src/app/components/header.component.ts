import { Component,OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {SEARCH_ICON,PROFILE_ICON,CART_ICON} from 'src/assets/svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-components',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(iconRegistry:MatIconRegistry,sanitizer: DomSanitizer,private router:Router){
    iconRegistry.addSvgIconLiteral('search-icon',sanitizer.bypassSecurityTrustHtml(SEARCH_ICON))
    iconRegistry.addSvgIconLiteral('profile-icon',sanitizer.bypassSecurityTrustHtml(PROFILE_ICON))
    iconRegistry.addSvgIconLiteral('cart-icon',sanitizer.bypassSecurityTrustHtml(CART_ICON))
  }

  ngOnInit(): void {
    
  }

  cartList(){
    this.router.navigate(['/cart'])
  }

}
