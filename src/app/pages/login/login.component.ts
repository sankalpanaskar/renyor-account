import { Component } from '@angular/core';
import { NbAuthService } from '@nebular/auth';

@Component({
  selector: 'ngx-login',
  template: `<nb-auth-block>
    <nb-login [strategy]="'email'"></nb-login>
  </nb-auth-block>`,
})
export class LoginComponent {

  constructor(private authService: NbAuthService) {}
}
