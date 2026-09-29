import { CLIENT_CONSTANTS } from "./client.constants";

export const CONFIG_CONSTANTS = {
  APP: {
    JSON_LIMIT: "50mb",
    ROOT_PATH: "/",
  },
  SERVER: {
    DEFAULT_PORT: 3000,
    DEFAULT_QR_SERVICE_URL: CLIENT_CONSTANTS.QR_SERVICE.DEFAULT_BASE_URL,
    SIGNALS: {
      SIGINT: "SIGINT",
      SIGTERM: "SIGTERM",
    },
  },
  LOGS: {
    STARTING: "Iniciando API Gateway de Orquestación Matricial (Express + TypeScript)...",
    QR_CONFIG: (url: string) => `Configuración del Microservicio QR Go: ${url}`,
    LISTENING: (port: number | string) => `API Gateway escuchando activamente en el puerto ${port}`,
    PRIMARY_ROUTE_READY: (port: number | string) => `Ruta principal lista: POST http://localhost:${port}/process`,
    SHUTDOWN_SIGNAL: (signal: string) => `Señal ${signal} recibida. Cerrando conexiones HTTP del Gateway...`,
    SHUTDOWN_SUCCESS: "API Gateway finalizado correctamente.",
  },
} as const;
