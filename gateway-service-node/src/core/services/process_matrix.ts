/*
 * ============================================================================
 * CASO DE USO Y SERVICIOS DE DOMINIO: Orquestación e Inteligencia Estadística
 * ============================================================================
 * 
 * Este archivo contiene dos componentes fundamentales:
 * 
 * 1. `DefaultStatsService`: Implementación concreta de las fórmulas numéricas
 *    (Norma de Frobenius, Media, Error de Reconstrucción en punto flotante).
 * 2. `ProcessMatrixUseCase`: El Orquestador de Dominio. Coordina la secuencia exacta:
 *    [Validación de Dominio] -> [Llamada HTTP a Go via Puerto] -> [Cálculo de Métricas] -> [Respuesta Final]
 * 
 * Inyección de Dependencias en el constructor, este caso de uso es 100% testeable
 * mediante pruebas unitarias aisladas sin hacer peticiones de red reales.
 */

import {
  assertValidMatrix,
  Matrix2D,
  MatrixStats,
  ProcessedMatrixResponse,
} from "../domain/matrix";
import { IQRClientPort } from "../ports/qr_client.port";
import { IStatsServicePort } from "../ports/stats_service.port";

/**
 * Servicio encargado de realizar análisis estadístico numérico sobre matrices.
 */
export class DefaultStatsService implements IStatsServicePort {
  public calculateStats(matrix: Matrix2D): MatrixStats {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const totalElements = rows * cols;

    let sum = 0;
    let sumSquares = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = matrix[i][j];
        sum += val;
        sumSquares += val * val;
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    const mean = totalElements > 0 ? sum / totalElements : 0;
    const frobeniusNorm = Math.sqrt(sumSquares);

    return {
      mean,
      frobeniusNorm,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
      sum,
    };
  }

  public calculateReconstructionError(
    original: Matrix2D,
    q: Matrix2D,
    r: Matrix2D
  ): number {
    const rows = original.length;
    const cols = original[0].length;
    const innerDim = r.length; // Dimensión interna n

    let diffSumSquares = 0;

    // Multiplicación matricial Q (m x n) * R (n x n) y cálculo de residuo ||A - QR||_F
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let qrElem = 0;
        for (let k = 0; k < innerDim; k++) {
          qrElem += q[i][k] * r[k][j];
        }
        const diff = original[i][j] - qrElem;
        diffSumSquares += diff * diff;
      }
    }

    return Math.sqrt(diffSumSquares);
  }
}

/**
 * Caso de Uso principal del orquestador Gateway.
 */
export class ProcessMatrixUseCase {
  constructor(
    private readonly qrClient: IQRClientPort,
    private readonly statsService: IStatsServicePort
  ) {}

  /**
   * Ejecuta el flujo secuencial completo de procesamiento matricial.
   * @param rawMatrix Payload recibido en la petición HTTP.
   */
  public async execute(rawMatrix: unknown): Promise<ProcessedMatrixResponse> {
    const startTimestamp = Date.now();

    // 1. Validar rigurosamente la matriz en el dominio del Gateway
    assertValidMatrix(rawMatrix);

    // 2. Delegar la factorización pesada al microservicio de Go mediante el puerto secundario
    const qrResult = await this.qrClient.decomposeMatrix(rawMatrix);

    // 3. Calcular métricas estadísticas independientes para A, Q y R
    const originalStats = this.statsService.calculateStats(rawMatrix);
    const qStats = this.statsService.calculateStats(qrResult.q);
    const rStats = this.statsService.calculateStats(qrResult.r);

    // 4. Medir el error de precisión matemática de la descomposición
    const reconstructionError = this.statsService.calculateReconstructionError(
      rawMatrix,
      qrResult.q,
      qrResult.r
    );

    const totalOrchestrationMs = Date.now() - startTimestamp;

    return {
      dimensions: {
        rows: rawMatrix.length,
        cols: rawMatrix[0].length,
      },
      originalStats,
      qrResult: {
        q: qrResult.q,
        r: qrResult.r,
        qStats,
        rStats,
        reconstructionErrorFrobenius: reconstructionError,
      },
      timing: {
        goExecutionMs: qrResult.execution_time_ms,
        totalOrchestrationMs,
      },
    };
  }
}
