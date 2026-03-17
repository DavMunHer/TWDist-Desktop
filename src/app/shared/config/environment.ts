// Environment configuration for different builds
// PROD: Change this file for production environment settings
// Use a relative URL so the Angular dev-server proxy can forward to the backend.
// This avoids cross-site cookie/SameSite issues for JWT_COOKIE auth and SSE.
const API_BASE_URL = '/api';

export const environment = {
  production: false,
  apiBaseUrl: API_BASE_URL,
};
