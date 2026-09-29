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
import express, { Application } from "express";
import { MatrixController } from "./adapters/http/controllers/matrix.controller";
import { createRouter } from "./adapters/http/routes";
import { CONFIG_CONSTANTS } from "./constants/config.constants";

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

  return app;
}
