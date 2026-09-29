export const HTTP_CONSTANTS = {
  ROUTES: {
    ROOT: "/",
    HEALTH: "/health",
    PROCESS: "/process",
  },
  HEALTH: {
    STATUS_HEALTHY: "healthy",
    SERVICE_NAME: "gateway-service-node",
  },
  CONTROLLER_MESSAGES: {
    MISSING_MATRIX_FIELD: "Petición incompleta: El campo 'matrix' es requerido en el cuerpo JSON.",
    DOMAIN_VALIDATION_ERROR: "Error de validación dimensional o de dominio matricial",
    BAD_GATEWAY_ERROR: "Bad Gateway: Imposible comunicarse con el motor QR de Go",
    INTERNAL_SERVER_ERROR: "Error interno del servidor Gateway",
    UNHANDLED_ERROR: "Error no controlado durante el procesamiento",
  },
  ERROR_SUBSTRINGS: {
    DOMAIN: [
      "La matriz",
      "Restricción matemática",
      "Asimetría dimensional",
    ],
    NETWORK: [
      "Falla en la comunicación",
      "Timeout",
    ],
  },
} as const;
