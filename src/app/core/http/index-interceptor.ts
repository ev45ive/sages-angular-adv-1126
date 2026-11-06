import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken('API_URL', {
  factory: () => 'http://localhost:3000/api/', // TODO: enviroment.ts
});

export const Auth = new InjectionToken('Auth', {
  factory: () => ({
    getToken: () => 'mock-access-u1',
  }),
});

export const URLInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.match(/^https?:/)) return next(req);

  const url = inject(API_URL); // Lazy

  return next(
    req.clone({
      url: url + req.url,
    }),
  );
};

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization')) return next(req);

  const auth = inject(Auth); // Lazy

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${auth.getToken()}`,
        // 'X-Tajne': '123',
      },
    }),
  );
};

import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable, pipe, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Extract responsibility:
  const notifications = inject(MatSnackBar);

  return next(req).pipe(
    httpErrorHandler(),
    catchError((error) => {
      notifications.open(error.message, 'Dismiss', {
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      // return new Observable()
      // return EMPTY
      throw error;
    }),
  );
};

// Chain of responsibility

// HttpClient.next = IntA
// IntA.next = IntB
// IntB.next = IntC
// IntC.next = HttpHandler ->  Observable< Resp.. > .pipe()  .subcribe()

export const httpErrorHandler = <T>(options?: {}) => pipe( retry<T>({
      count: 3,
      delay(error, retryCount) {
        const RETRYABLE_HTTP_CODES = [
          0, // No response
          408, // Request Timeout
          429, // Too Many Requests
          500, // Internal Server Error
          502, // Bad Gateway
          503, // Service Unavailable
          504, // Gateway Timeout
        ];

        if (!(error instanceof HttpErrorResponse)) throw error;
        if (!RETRYABLE_HTTP_CODES.includes(error.status)) throw error;

        return timer(500 * retryCount ** 2); // Exponential - 500, 2000, 4500
      },
    }),
    timeout(5_000),
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse)) throw new Error('Unexpected Error');

      const message = error.error.error?.message ?? 'Unexpected Server Error';

      throw new Error(message);
    }),
  );
