export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  HEALTH: '/health',
  PROCESS: '/process',
} as const;

export const STORAGE_KEYS = {
  JWT_TOKEN: 'qr_jwt_token',
} as const;

export const SERVICE_NAMES = {
  GATEWAY: 'Gateway (Node.js)',
  QR_ENGINE: 'QR Engine (Go)',
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
} as const;

export const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000;
