import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Credentials Interceptor
 * Automatically sends HTTP-only cookies with all requests
 * 
 * This interceptor adds `withCredentials: true` to all outgoing requests,
 * which tells the browser to include any HTTP-only cookies in the request.
 * This is essential for cookie-based authentication where the auth token
 * is stored in an HTTP-only cookie (set by the server during login).
 * 
 * The HTTP-only flag prevents JavaScript from accessing the cookie,
 * protecting against XSS attacks while still allowing it to be sent
 * automatically with each request.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request and enable credentials (cookies)
  const credentializedReq = req.clone({
    withCredentials: true,
  });

  return next(credentializedReq);
};
