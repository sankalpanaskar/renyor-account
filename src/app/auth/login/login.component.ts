import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthSimpleToken, NbAuthService, NbTokenService } from '@nebular/auth';
import { NbSpinnerService, NbToastrService } from '@nebular/theme';  // Import the correct service
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class NgxLoginComponent {
  email: any;
  password: any;
  isLoading: boolean = false;  // Ensure this is set to false initially

  constructor(
    private authService: NbAuthService,
    private tokenService: NbTokenService,
    private router: Router,
    private http: HttpClient,
    private globalService: GlobalService,
    private toastrService: NbToastrService,
  ) {}

  login() {
    this.authService.authenticate('email', {
        email: this.email.trim(),
        password: this.password.trim(),
      }).subscribe({
        next: (result) => {
          if (result.isSuccess()) {
            const response: any = result.getResponse();
            const token = response?.body?.data?.token;
            const user = response?.body?.data?.user;
            console.log(response)
            if (token && user) {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('user', JSON.stringify(user));
              this.tokenService.set(new NbAuthSimpleToken(token, 'email'));
              this.globalService.setUser(user);
              
              this.toastrService.success(response?.body?.message || 'Login successful', 'Success');
              this.router.navigate(['/pages/custom-dashboard']);
              // // ✅ Redirect based on role_id
              //   if (user.role_id === 17) {
              //     this.router.navigate(['/pages/admin-dashboard']);
              //   } else {
              //     this.router.navigate(['/pages/custom-dashboard']);
              //   }
              this.isLoading = false;
            } else {
              this.toastrService.danger('Invalid login response', 'Login Failed');
            }
          } else {
            this.toastrService.danger('Invalid credentials', 'Login Failed');
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.log('Email login failed', err);
          this.toastrService.danger(err?.error?.message || 'Login failed', 'Error');
          this.isLoading = false;
        }
      });
  }


  
}

