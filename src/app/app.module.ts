/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
} from '@nebular/theme';
import { NbAuthJWTToken, NbAuthModule, NbAuthSimpleToken, NbPasswordAuthStrategy } from '@nebular/auth';
import { authGuard } from './auth/auth.guard';
import { TokenInterceptor } from './interceptors/token.interceptor';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NbLayoutModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbDatepickerModule.forRoot(),  // only once at root level
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    NbAuthModule.forRoot({
      strategies: [
        NbPasswordAuthStrategy.setup({
          name: 'email',
          baseEndpoint: 'https://assetapi.anudip.org/api',
          login: {
            endpoint: '/login',
            method: 'post',
          },
          register: {
            endpoint: '/register',
            method: 'post',
          },
 token: {
  class: NbAuthSimpleToken,
  key: 'data.token',
  getter: (module, res) => {
    try {
      // Get the raw response body
      const body = res?.body;

      if (!body) return null;

      // If backend sends base64 message
      if (body.message && typeof body.message === 'string') {
        const decodedStr = atob(body.message);
        const decoded = JSON.parse(decodedStr);
        return decoded?.data?.token ?? null; // ✅ Return the real token
      }

      // Otherwise, fallback for normal JSON
      return body?.data?.token ?? null;
    } catch (e) {
      console.error('❌ Token getter error:', e);
      return null;
    }
  },
},

        }),
      ],
      forms: {},
    }),
    
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ]
})
export class AppModule {
}
