/*
 * ============================================================================
 * ENRUTADOR EXPRÉSS: Mapeo de Endpoints y Rutas HTTP
 * ============================================================================
 */

import { Router } from "express";
import { MatrixController } from "./controllers/matrix.controller";

export function createRouter(matrixController: MatrixController): Router {
  const router = Router();

  // Endpoint de comprobación de salud del Gateway
  router.get("/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "gateway-service-node",
    });
  });

  // Endpoint principal exigido por el requerimiento: POST /process
  router.post("/process", matrixController.handleProcess);

  return router;
}
