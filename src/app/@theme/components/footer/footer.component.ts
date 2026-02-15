import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      © Copyright 2025.<b><a href="https://renyor.com" target="_blank">Renyor</a></b>
    </span>
    <div class="socials">
      <a href="https://www.facebook.com/itsRenYor" target="_blank" class="ion ion-social-facebook"></a>
      <a href="https://x.com/itsRenYor" target="_blank" class="ion ion-social-twitter"></a>
      <a href="https://www.instagram.com/itsrenyor/" target="_blank" class="ion ion-social-instagram"></a>
      <a href="https://www.youtube.com/channel/UCWhcXUC8UoSqr0qUvHBq3Hg" target="_blank" class="ion ion-social-youtube"></a>
      <a href="https://wa.me/918335833329" target="_blank" class="ion ion-social-whatsapp"></a>
    </div>
  `,
})
export class FooterComponent {
}
