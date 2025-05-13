import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const member = parsedUser?.member;

      this.user = {
        name: `${member?.first_name ?? ''} ${member?.last_name ?? ''}`.trim(),
        email: parsedUser?.email,
        mobile: parsedUser?.mobile,
        designation: member?.designation,
        department: member?.department,
        base_location: member?.base_location,
        picture: parsedUser?.user_image
          ? 'https://cmis4api.anudip.org/public/' + 'uploads/user_image/' + parsedUser.user_image
          : 'assets/images/profile.png',
      };
      console.log("parshed user",parsedUser);
      console.log("user",this.user);


    }
  }
}
