/*
 * ============================================================================
 * ENRUTADOR EXPRÉSS: Mapeo de Endpoints y Rutas HTTP
 * ============================================================================
 */

import { Router } from "express";
import { AuthController } from "./controllers/auth.controller";
import { MatrixController } from "./controllers/matrix.controller";
import { authenticateJWT } from "./middlewares/auth.middleware";
import { HTTP_CONSTANTS } from "../../constants/http.constants";

export function createRouter(matrixController: MatrixController): Router {
  const router = Router();
  const authController = new AuthController();

  // Endpoint público: Comprobación de salud del Gateway (sin autenticación para monitoreo)
  router.get(HTTP_CONSTANTS.ROUTES.HEALTH, (_req, res) => {
    res.status(200).json({
      status: HTTP_CONSTANTS.HEALTH.STATUS_HEALTHY,
      service: HTTP_CONSTANTS.HEALTH.SERVICE_NAME,
    });
  });

  // Endpoint público: Login para obtener token JWT
  router.post(HTTP_CONSTANTS.ROUTES.AUTH_LOGIN, authController.handleLogin);

  // Endpoint privado: POST /process protegido exclusivamente con JWT
  router.post(
    HTTP_CONSTANTS.ROUTES.PROCESS,
    authenticateJWT,
    matrixController.handleProcess
  );

  return router;
}
