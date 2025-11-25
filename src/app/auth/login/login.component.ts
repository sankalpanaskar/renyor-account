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
  try {
    console.log('🔹 Login button clicked');

    const isMobileLogin = /^[0-9]+$/.test(this.email.trim());
    console.log('Login type:', isMobileLogin ? 'Mobile' : 'Email');

    this.isLoading = true;

    // helper to decode Base64 API message
    const decodeApiMessage = (base64: string) => {
      try {
        const jsonStr = atob(base64);
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error('❌ Failed to decode API message:', e);
        return null;
      }
    };
      console.log('📡 Sending email login request via Nebular...');

      this.authService.authenticate('email', {
        user_id: this.email.trim(),
        password: this.password.trim(),
      }).subscribe({
        next: (result) => {
          console.log('✅ Raw Nebular Auth result:', result);

          if (!result.isSuccess()) {
            this.toastrService.danger('Invalid credentials', 'Login Failed');
            this.isLoading = false;
            return;
          }

          const raw = result.getResponse();
          const body = raw?.body;
          console.log('📦 Raw HTTP response body:', body);

          // Decode base64 message if needed
          let payload = body;
          if (body?.message && typeof body.message === 'string') {
            const decoded = decodeApiMessage(body.message);
            if (decoded) payload = decoded;
          }

          console.log('📦 Decoded email payload:', payload);

          const token = payload?.data?.token;
          const user = payload?.data?.userDetails;

          if (token && user) {
            console.log('✅ Token and user extracted successfully');
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
            this.tokenService.set(new NbAuthSimpleToken(token, 'email'));
            this.globalService.setUser(user);

            this.toastrService.success(payload?.message || 'Login successful', 'Success');
            this.router.navigate(['/pages/custom-dashboard']);

          } else {
            console.error('⚠️ Invalid login response format:', payload);
            this.toastrService.danger('Invalid login response', 'Login Failed');
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Email login failed:', err);
          this.toastrService.danger(err?.error?.message || 'Login failed', 'Error');
          this.isLoading = false;
        },
      });
    }
  catch (err) {
    console.error('💥 Unexpected login error:', err);
    this.toastrService.danger('Unexpected error occurred', 'Login Failed');
    this.isLoading = false;
  }
}


  
}

