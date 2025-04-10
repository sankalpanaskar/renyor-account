import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NbAuthSimpleToken, NbAuthService, NbTokenService, NbLoginComponent } from '@nebular/auth';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class NgxLoginComponent{
  email: any;
  password: any;
  client_ip:any

  constructor(
    private authService: NbAuthService,
    private tokenService: NbTokenService,
    private router: Router
  ) {}

  login() {
    this.authService.authenticate('email', {
      user_id: this.email,
      password: this.password,
    }).subscribe(result => {
      console.log('Full result:', result);
      if (result.isSuccess()) {
        const response: any = result.getResponse();
        const token = response?.body?.data?.token;
        const user = response?.body?.data?.userDetails;
  
        if (token && user) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));
  
          this.tokenService.set(new NbAuthSimpleToken(token, 'email'));
          this.router.navigate(['/pages/dashboard']);
        }
      } else {
        console.log('Login failed');
      }
    });
  }

}
