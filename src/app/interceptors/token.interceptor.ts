import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { NbTokenService } from '@nebular/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastrService: NbToastrService,
    private tokenService: NbTokenService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 🔥 Handle expired/invalid token here
        if (error.status === 401 || error.status === 403) {
          this.handleAuthError(error);
        }

        // ⛔ IMPORTANT: rethrow the real HttpErrorResponse, not a function
        return throwError(error); // <- change was here
        // or:  return throwError(() => error);  (works in RxJS 7, but since you see () => error in subscriber, this line is safer for you)
      }),
    );
  }

  private handleAuthError(error: HttpErrorResponse): void {
    const msg =
      (error?.error && (error.error.message || error.error.error)) ||
      error?.message ||
      'Your session has expired. Please log in again.';

    this.toastrService.warning(msg, 'Session Expired', {
      duration: 5000,
      destroyByClick: true,
      hasIcon: true,
    });

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    this.tokenService.clear().subscribe({
      complete: () => {
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
