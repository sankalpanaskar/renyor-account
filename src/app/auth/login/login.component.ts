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
    const isMobileLogin = /^[0-9]/.test(this.email);
    this.isLoading = true;
  
    if (isMobileLogin) {
      this.http.post('https://leadapi.anudip.org/public/api/student-login', {
        user_id: this.email.trim(),
        password: this.password.trim(),
      }).subscribe({
        next: (res: any) => {
          const token = res?.data?.token;
          const user = res?.data?.userDetails;
  
          if (token && user) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
            this.tokenService.set(new NbAuthSimpleToken(token, 'mobile'));
            this.globalService.setUser(user);
            
            this.toastrService.success(res?.message || 'Login successful', 'Success');
            this.router.navigate(['/pages/student/student-details']);
            this.isLoading = false;
          } else {
            this.toastrService.danger('Invalid response from server', 'Login Failed');
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.log('Mobile login failed', err);
          this.toastrService.danger(err?.error?.message || 'Login failed', 'Error');
          this.isLoading = false;
        }
      });
    } else {
      this.authService.authenticate('email', {
        user_id: this.email.trim(),
        password: this.password.trim(),
      }).subscribe({
        next: (result) => {
          if (result.isSuccess()) {
            const response: any = result.getResponse();
            const token = response?.body?.data?.token;
            const user = response?.body?.data?.userDetails;
  
            if (token && user) {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('user', JSON.stringify(user));
              this.tokenService.set(new NbAuthSimpleToken(token, 'email'));
              this.globalService.setUser(user);
              
              this.toastrService.success(response?.body?.message || 'Login successful', 'Success');
              this.router.navigate(['/pages/custom-dashboard']);
              // this.router.navigate(['/pages/manage-lead']);
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
  
}

