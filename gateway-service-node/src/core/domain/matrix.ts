// Matrix2D abstrae una matriz bidimensional real como un arreglo de arreglos de números float64.
export type Matrix2D = number[][];

// MatrixDimensions representa las propiedades dimensionales m x n de la matriz.
export interface MatrixDimensions {
  readonly rows: number;
  readonly cols: number;
}

// QRDecompositionResponse define la respuesta cruda retornada por el microservicio en Go.
export interface QRDecompositionResponse {
  readonly q: Matrix2D;
  readonly r: Matrix2D;
  readonly execution_time_ms: number;
}

// MatrixStats condensa métricas estadísticas avanzadas calculadas en el Gateway.
export interface MatrixStats {
  readonly mean: number;
  readonly frobeniusNorm: number;
  readonly min: number;
  readonly max: number;
  readonly sum: number;
}

// ProcessedMatrixResponse es la respuesta final de valor agregado entregada al cliente HTTP.
export interface ProcessedMatrixResponse {
  readonly dimensions: MatrixDimensions;
  readonly originalStats: MatrixStats;
  readonly qrResult: {
    readonly q: Matrix2D;
    readonly r: Matrix2D;
    readonly qStats: MatrixStats;
    readonly rStats: MatrixStats;
    readonly reconstructionErrorFrobenius: number;
  };
  readonly timing: {
    readonly goExecutionMs: number;
    readonly totalOrchestrationMs: number;
  };
}

/**
 * Validador de tipo puro (Type Guard / Assertion) para estructuras matriciales.
 * TypeScript desaparece en tiempo de ejecución (Transpiliación a JS).
 * Esta función garantiza la validez física del objeto en runtime lanzando excepciones de dominio explícitas.
 */
import { DOMAIN_CONSTANTS } from "../../constants/domain.constants";

export function assertValidMatrix(matrix: unknown): asserts matrix is Matrix2D {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error(DOMAIN_CONSTANTS.ERRORS.EMPTY_MATRIX);
  }

  const rows = matrix.length;
  const cols = matrix[0]?.length;

  if (typeof cols !== "number" || cols === 0) {
    throw new Error(DOMAIN_CONSTANTS.ERRORS.EMPTY_ROW);
  }

  for (let i = 0; i < rows; i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) {
      throw new Error(DOMAIN_CONSTANTS.ERRORS.INVALID_ROW(i));
    }

    if (row.length !== cols) {
      throw new Error(
        DOMAIN_CONSTANTS.ERRORS.DIMENSIONAL_ASYMMETRY(i, row.length, cols)
      );
    }

    for (let j = 0; j < cols; j++) {
      const val = row[j];
      if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
        throw new Error(
          DOMAIN_CONSTANTS.ERRORS.INVALID_NUMERIC_VALUE(i, j)
        );
      }
    }
  }

  if (rows < cols) {
    throw new Error(
      DOMAIN_CONSTANTS.ERRORS.QR_RESTRICTION_TALL_OR_SQUARE(rows, cols)
    );
  }

  /*
   * ============================================================================
   * LIMITACIONES DEL PROTOCOLO DE TRANSPORTE (HTTP/HTTPS + JSON REST):
   * ============================================================================
   * 1. Límite de Serialización JSON: Cada celda numérica float64 ocupa ~15-20 bytes en texto plano.
   *    Una matriz >1000x1000 (~1.000.000 de celdas) produce payloads entrantes/salientes de 40MB a 60MB.
   * 2. Bloqueo de Event Loop (Single-Thread Node.js): JSON.stringify() y JSON.parse() son operaciones
   *    síncronas en el motor V8. Matrices de gran escala congelan el hilo durante segundos.
   * 3. Overhead de Criptografía TLS en HTTPS: Transferir payloads de decenas de megabytes sobre HTTPS
   *    añade un coste computacional de cifrado/descifrado simétrico por chunks (AES-GCM / ChaCha20).
   * 4. Timeouts de Conexión: La latencia de transporte HTTP + tiempo de factorización excede
   *    los timeouts estándar (30s) ante matrices masivas.
   * Recomendación Arquitectural para escala superior: gRPC con buffers binarios Protobuf o Streaming.
   * ============================================================================
   */
  if (
    rows > DOMAIN_CONSTANTS.LIMITS.MAX_ROWS ||
    cols > DOMAIN_CONSTANTS.LIMITS.MAX_COLS ||
    rows * cols > DOMAIN_CONSTANTS.LIMITS.MAX_ELEMENTS
  ) {
    throw new Error(
      DOMAIN_CONSTANTS.ERRORS.EXCEEDS_MAX_DIMENSIONS(
        rows,
        cols,
        DOMAIN_CONSTANTS.LIMITS.MAX_ROWS,
        DOMAIN_CONSTANTS.LIMITS.MAX_COLS
      )
    );
  }
}
