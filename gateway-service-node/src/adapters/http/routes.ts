/*
 * ============================================================================
 * ENRUTADOR EXPRÉSS: Mapeo de Endpoints y Rutas HTTP
 * ============================================================================
 */

import { Router } from "express";
import { MatrixController } from "./controllers/matrix.controller";
import { HTTP_CONSTANTS } from "../../constants/http.constants";

export function createRouter(matrixController: MatrixController): Router {
  const router = Router();

  // Endpoint de comprobación de salud del Gateway
  router.get(HTTP_CONSTANTS.ROUTES.HEALTH, (_req, res) => {
    res.status(200).json({
      status: HTTP_CONSTANTS.HEALTH.STATUS_HEALTHY,
      service: HTTP_CONSTANTS.HEALTH.SERVICE_NAME,
    });
  });

  // Endpoint principal exigido por el requerimiento: POST /process
  router.post(HTTP_CONSTANTS.ROUTES.PROCESS, matrixController.handleProcess);

  return router;
}
