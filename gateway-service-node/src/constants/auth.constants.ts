export const AUTH_CONSTANTS = {
  JWT: {
    DEFAULT_SECRET: "default_dev_secret_interseguro_qr_2026",
    DEFAULT_EXPIRES_IN: "1h",
    BEARER_PREFIX: "Bearer ",
  },
  INTERNAL_API_KEY: {
    HEADER_NAME: "x-internal-api-key",
    DEFAULT_KEY: "internal_secret_interseguro_key_2026",
  },
  MESSAGES: {
    MISSING_TOKEN: "Acceso denegado: Cabecera 'Authorization: Bearer <token>' requerida.",
    INVALID_TOKEN: "Token JWT inválido o expirado.",
    LOGIN_SUCCESS: "Autenticación satisfactoria.",
    INVALID_CREDENTIALS: "Credenciales de acceso inválidas.",
    MISSING_CREDENTIALS: "Se requieren los campos 'username' y 'password'.",
  },
  MOCK_USER: {
    DEFAULT_USERNAME: "admin",
    DEFAULT_PASSWORD: "secretpassword123",
  },
} as const;
