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

function bootstrap() {
  const port = process.env.PORT || 3000;
  const qrServiceUrl = process.env.QR_SERVICE_URL || "http://localhost:8080/qr/decompose";

  console.log("Iniciando API Gateway de Orquestación Matricial (Express + TypeScript)...");
  console.log(`Configuración del Microservicio QR Go: ${qrServiceUrl}`);

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
    console.log(`API Gateway escuchando activamente en el puerto ${port}`);
    console.log(`Ruta principal lista: POST http://localhost:${port}/process`);
  });

  // Manejo de apagado controlado (Graceful Shutdown)
  const handleShutdown = (signal: string) => {
    console.log(`Señal ${signal} recibida. Cerrando conexiones HTTP del Gateway...`);
    server.close(() => {
      console.log("API Gateway finalizado correctamente.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

bootstrap();
