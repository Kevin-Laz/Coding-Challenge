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

export function createApp(matrixController: MatrixController): Application {
  const app: Application = express();

  // Configuración de middlewares globales
  app.use(cors());
  
  // Soporte para matrices extensas mediante elevación del límite del Body Parser JSON
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Registrar enrutador con controladores inyectados
  const router = createRouter(matrixController);
  app.use("/", router);

  return app;
}
