/*
 * ============================================================================
 * PUNTO DE ENTRADA Y RAÍZ DE COMPOSICIÓN (Composition Root)
 * ============================================================================
 * 
 * Este archivo representa el punto de entrada ejecutable del API Gateway en Node.js.
 * Aquí realizamos el ensamblaje completo del Grafo de Inyección de Dependencias:
 * 
 * [QRHttpClientAdapter (Secundario)] ─┐
 *                                     ├─► [ProcessMatrixUseCase (Caso de Uso)]
 * [DefaultStatsService (Dominio)]    ─┘             │
 *                                                   ▼
 *                                     [MatrixController (Primario)]
 *                                                   │
 *                                                   ▼
 *                                       [Express App (Servidor)]
 */

import { MatrixController } from "./adapters/http/controllers/matrix.controller";
import { QRHttpClientAdapter } from "./adapters/secondary/qr_http_client";
import { createApp } from "./app";
import { DefaultStatsService, ProcessMatrixUseCase } from "./core/services/process_matrix";
import { CONFIG_CONSTANTS } from "./constants/config.constants";

function bootstrap() {
  const port = process.env.PORT || CONFIG_CONSTANTS.SERVER.DEFAULT_PORT;
  const qrServiceUrl =
    process.env.QR_SERVICE_URL || CONFIG_CONSTANTS.SERVER.DEFAULT_QR_SERVICE_URL;

  console.log(CONFIG_CONSTANTS.LOGS.STARTING);
  console.log(CONFIG_CONSTANTS.LOGS.QR_CONFIG(qrServiceUrl));

  // 1. Instanciar Adaptador Secundario (Cliente HTTP externo hacia Go)
  const qrClientAdapter = new QRHttpClientAdapter(qrServiceUrl);

  // 2. Instanciar Servicio de Dominio Estadístico
  const statsService = new DefaultStatsService();

  // 3. Instanciar Caso de Uso (Orquestador Core) inyectando dependencias
  const processMatrixUseCase = new ProcessMatrixUseCase(qrClientAdapter, statsService);

  // 4. Instanciar Adaptador Primario (Controlador Express HTTP)
  const matrixController = new MatrixController(processMatrixUseCase);

  // 5. Crear y encender servidor Express
  const app = createApp(matrixController);

  const server = app.listen(port, () => {
    console.log(CONFIG_CONSTANTS.LOGS.LISTENING(port));
    console.log(CONFIG_CONSTANTS.LOGS.PRIMARY_ROUTE_READY(port));
  });

  // Manejo de apagado controlado (Graceful Shutdown)
  const handleShutdown = (signal: string) => {
    console.log(CONFIG_CONSTANTS.LOGS.SHUTDOWN_SIGNAL(signal));
    server.close(() => {
      console.log(CONFIG_CONSTANTS.LOGS.SHUTDOWN_SUCCESS);
      process.exit(0);
    });
  };

  process.on(CONFIG_CONSTANTS.SERVER.SIGNALS.SIGINT, () =>
    handleShutdown(CONFIG_CONSTANTS.SERVER.SIGNALS.SIGINT)
  );
  process.on(CONFIG_CONSTANTS.SERVER.SIGNALS.SIGTERM, () =>
    handleShutdown(CONFIG_CONSTANTS.SERVER.SIGNALS.SIGTERM)
  );
}

bootstrap();
