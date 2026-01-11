import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../config/environment';


export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if the request already has a full URL
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  // Clone the request and add the base URL
  const baseUrlReq = req.clone({
    url: `${environment.apiBaseUrl}${req.url}`,
  });

  return next(baseUrlReq);
};
