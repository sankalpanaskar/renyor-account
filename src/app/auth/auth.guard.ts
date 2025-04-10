// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NbTokenService } from '@nebular/auth';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(NbTokenService);
  const router = inject(Router);

  return tokenService.get().pipe(
    map(token => {
      if (token && token.getValue()) {
        return true;
      } else {
        console.log("noLogin");
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};
