import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const username = 'hr_admin';
    const password = 'hr_secret_123';
    const credentials = btoa(`${username}:${password}`);

    const authReq = request.clone({
      setHeaders: {
        Authorization: `Basic ${credentials}`
      }
    });

    return next.handle(authReq);
  }
}
