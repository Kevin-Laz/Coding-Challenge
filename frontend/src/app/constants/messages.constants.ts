export const GLOBAL_MESSAGES = {
  AUTH_REQUIRED: 'Debe iniciar sesión para procesar matrices.',
  AUTH_FAILED_PREFIX: 'Fallo de autenticación: ',
  NETWORK_OR_SERVER_ERROR: 'Error de red o servidor no disponible.',
  SERVICE_COLD_START_502:
    'El motor QR se está iniciando o tardó en responder. Aguarde unos segundos y vuelva a intentar.',
  TIMEOUT_504:
    'Tiempo de espera agotado comunicándose con el motor de cálculo.',
  SERVICE_UNAVAILABLE_503:
    'El servicio no se encuentra disponible temporalmente.',
  UNAUTHORIZED_401:
    'Sesión expirada o no autorizada. Inicie sesión nuevamente.',
} as const;
