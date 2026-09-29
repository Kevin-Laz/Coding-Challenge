/*
 * ============================================================================
 * FABRICA DE APLICACIÓN EXPRESS (Application Setup)
 * ============================================================================
 * Separar `app.ts` de `server.ts`:
 * 1. Facilita las pruebas de integración E2E (Supertest): Podemos importar `app` en tests
 *    sin iniciar el listener de puertos de red de `server.ts`.
 * 2. Middlewares de Payload: Configuramos el tamaño del body parser JSON en `50mb`
 *    para permitir el envío de matrices numéricas de gran escala sin arrojar 'PayloadTooLargeError'.
 */

import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express";
import { MatrixController } from "./adapters/http/controllers/matrix.controller";
import { createRouter } from "./adapters/http/routes";
import { CONFIG_CONSTANTS } from "./constants/config.constants";
import { HTTP_CONSTANTS } from "./constants/http.constants";

/*
 * ============================================================================
 * CONSIDERACIONES DE TRANSPORTE HTTP/HTTPS EN EL API GATEWAY:
 * ============================================================================
 * 1. Tamaño Máximo del Body (50MB):
 *    Se configura express.json({ limit: "50mb" }). Matrices que superen este umbral en texto
 *    plano son interceptadas por el parser antes de llegar al enrutador.
 * 2. Cifrado TLS/HTTPS en Cargas Voluminosas:
 *    En conexiones HTTPS/TLS, paquetes masivos (>50MB) incrementan el consumo de CPU debido a la
 *    fragmentación de registros TLS y cifrado simétrico por tramas TCP.
 * 3. Manejo de Errores de Middleware:
 *    Se implementa un error-handling middleware al final del pipeline para responder
 *    con HTTP 413 (Payload Too Large) y formato JSON estructurado estándar si se supera el límite.
 * ============================================================================
 */
export function createApp(matrixController: MatrixController): Application {
  const app: Application = express();

  // Configuración de middlewares globales
  app.use(cors());
  
  // Soporte para matrices extensas mediante elevación del límite del Body Parser JSON
  app.use(express.json({ limit: CONFIG_CONSTANTS.APP.JSON_LIMIT }));
  app.use(
    express.urlencoded({ extended: true, limit: CONFIG_CONSTANTS.APP.JSON_LIMIT })
  );

  // Registrar enrutador con controladores inyectados
  const router = createRouter(matrixController);
  app.use(CONFIG_CONSTANTS.APP.ROOT_PATH, router);

  // Middleware global para captura de excepciones de middlewares (ej. 413 PayloadTooLargeError, 400 Bad JSON)
  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      _next: NextFunction
    ): void => {
      if (err && typeof err === "object") {
        const errorObj = err as { type?: string; status?: number; message?: string };
        if (errorObj.type === "entity.too.large" || errorObj.status === 413) {
          res.status(413).json({
            error: HTTP_CONSTANTS.CONTROLLER_MESSAGES.PAYLOAD_TOO_LARGE,
            details: errorObj.message || `Límite configurado: ${CONFIG_CONSTANTS.APP.JSON_LIMIT}`,
          });
          return;
        }

        if (errorObj.status === 400 && "body" in errorObj) {
          res.status(400).json({
            error: "JSON malformado o sintaxis de cuerpo HTTP inválida.",
            details: errorObj.message,
          });
          return;
        }
      }

      res.status(500).json({
        error: HTTP_CONSTANTS.CONTROLLER_MESSAGES.INTERNAL_SERVER_ERROR,
        details: err instanceof Error ? err.message : String(err),
      });
    }
  );

  return app;
}
