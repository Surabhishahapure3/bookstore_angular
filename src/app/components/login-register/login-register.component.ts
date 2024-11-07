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

  constructor(private userService: UserServiceService, private dialogRef: MatDialogRef<LoginRegisterComponent>) { }

  toggleForm(formType: 'login' | 'signup'): void {
    this.isLogin = formType === 'login';
  }

  onLoginSubmit(): void {
    console.log('Login submitted with:', this.loginData);
    this.userService.login(this.loginData.email, this.loginData.password)
      .subscribe(
        (response: LoginResponse) => {
          console.log('Login response:', response);
          if (response.code === 200 && response.data && response.data.token) {
            console.log('Login successful, token:', response.data.token);
            this.userService.setToken(response.data.token);
            this.onSuccessfulLogin();
          } else {
            console.error('Login failed: Unexpected response structure', response);
          }
        },
        error => {
          console.error('Login failed', error);
        }
      );
  }
  
  onSignupSubmit(): void {
    console.log('Signup data:', this.signupData);
  
    this.userService.signup(this.signupData)
      .subscribe({
        next: (response) => {
          console.log('Signup successful', response);
          this.isLogin = true;
        },
        error: (error) => {
          console.error('Error during registration', error);
          if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
          } else {
            console.error(`Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`);
          }
          this.errorMessage = 'Registration failed. Please try again later.';
        }
      });
  }

  loginWith(provider: string): void {
    console.log(`Login with ${provider}`);
  }

  logout(): void {
    this.userService.removeToken();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onSuccessfulLogin(): void {
    this.dialogRef.close('success');
  }
}
