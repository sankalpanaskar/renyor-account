import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      © Copyright 2025.<b><a href="https://anudip.org" target="_blank">Anudip Foundation for Social welfare</a></b>
    </span>
    <div class="socials">
      <a href=" https://www.facebook.com/AnudipFoundation/" target="_blank" class="ion ion-social-facebook"></a>
      <a href="https://x.com/AnudipF" target="_blank" class="ion ion-social-twitter"></a>
      <a href="https://www.linkedin.com/company/anudip-foundation-for-social-welfare/" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
})
export class FooterComponent {
}
