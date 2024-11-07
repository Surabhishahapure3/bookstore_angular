import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserServiceService, LoginResponse, SignupData } from 'src/services/user-service/user-service.service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})
export class LoginRegisterComponent {

  isLogin = true;
  loginData = { email: '', password: '' };
  signupData: SignupData = { name: '', email: '', password: '', confirmpassword: '', number: '' };
  errorMessage: string | undefined;

  constructor(private userService: UserServiceService,private dialogRef: MatDialogRef<LoginRegisterComponent>) { }

  toggleForm(formType: 'login' | 'signup'): void {
    this.isLogin = formType === 'login';
  }

  onLoginSubmit(): void {
    console.log('Login submitted with:', this.loginData); // Debug log
    this.userService.login(this.loginData.email, this.loginData.password)
      .subscribe(
        (response: LoginResponse) => {
          console.log('Login response:', response); // Debug log
          if (response.code === 200 && response.data && response.data.token) {
            console.log('Login successful, token:', response.data.token); // Debug log
            this.userService.setToken(response.data.token);
            this.onSuccessfulLogin();
            // Handle successful login (e.g., redirect to dashboard)
          } else {
            console.error('Login failed: Unexpected response structure', response);
            // Handle unexpected response structure
          }
        },
        error => {
          console.error('Login failed', error);
          // Handle login error
        }
      );
  }

  onSignupSubmit(): void {
    console.log('Signup data:', this.signupData); // Remove in production
  
    this.userService.signup(this.signupData)
      .subscribe({
        next: (response) => {
          console.log('Signup successful', response);
          this.isLogin = true;
          // Consider adding a success message or redirecting the user
        },
        error: (error) => {
          console.error('Error during registration', error);
          if (error.error instanceof ErrorEvent) {
            // Client-side or network error
            console.error('An error occurred:', error.error.message);
          } else {
            // Backend returned an unsuccessful response code
            console.error(
              `Backend returned code ${error.status}, ` +
              `body was: ${JSON.stringify(error.error)}`
            );
          }
          // Display user-friendly error message
          this.errorMessage = 'Registration failed. Please try again later.';
        }
      });
  }

  loginWith(provider: string): void {
    // Implement social login logic here
    console.log(`Login with ${provider}`);
  }

  logout(): void {
    this.userService.removeToken();
    // Additional logout logic (e.g., redirect to home page)
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  onSuccessfulLogin(): void {
    this.dialogRef.close('success');
  }

}
