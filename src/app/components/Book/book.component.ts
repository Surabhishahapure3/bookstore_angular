import { Component, OnInit } from '@angular/core';
import { BookService } from 'src/services/book-service/book.service';
import { Router } from '@angular/router'; // Import Router for navigation
import { HttpClient } from '@angular/common/http';

import { ActivatedRoute } from '@angular/router';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {
  books: any[] = [];
  bookDetails: any;
  
  

  constructor(private bookservice: BookService,private router: Router, private http: HttpClient,private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.bookservice.getBooks().subscribe(
      (reponse) => {
        if(reponse && reponse.data){
          this.books = reponse.data
        }
      },
      (error) => {
        console.error('Error fetching book data', error); // Use console directly
      }
    );
  }

  onBookClick(bookId: string) {
    if (bookId) {
      console.log("Clicked book ID:", bookId);
  
      
      this.bookservice.getBookbyId(bookId).subscribe(
        (response: any) => {
          const bookDetails = response.data;
          console.log("Book details fetched:", bookDetails); 
          const navigationUrl = `/book/${bookId}`;
console.log("Navigating to:", navigationUrl);
this.router.navigate([navigationUrl], { state: { book: bookDetails } }).then(success => {
            if (success) {
              console.log('Navigation successful!');
            } else {
              console.log('Navigation failed!');
            }
          });
        },
        (error) => {
          console.error('Error fetching book details', error);
        }
      );
    } else {
      console.error('Invalid book ID:', bookId);
    }
  }
  

  }
