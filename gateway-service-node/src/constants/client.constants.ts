export const CLIENT_CONSTANTS = {
  QR_SERVICE: {
    DEFAULT_BASE_URL: "http://localhost:8080/qr/decompose",
    DEFAULT_TIMEOUT_MS: 30000,
    METHOD: "POST",
    CONTENT_TYPE_JSON: "application/json",
    ABORT_ERROR_NAME: "AbortError",
    ERRORS: {
      SERVICE_STATUS: (status: number, text: string) =>
        `El servicio QR en Go devolvió un status ${status}: ${text}`,
      TIMEOUT: (timeoutMs: number) =>
        `Timeout de red (${timeoutMs}ms) al comunicarse con el microservicio QR en Go.`,
      COMMUNICATION_FAILURE: (detail: string) =>
        `Falla en la comunicación con Go QR Service: ${detail}`,
      UNKNOWN: "Error desconocido al invocar el microservicio externo QR.",
    },
  },
} as const;
