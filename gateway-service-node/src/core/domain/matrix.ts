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
export function assertValidMatrix(matrix: unknown): asserts matrix is Matrix2D {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error("La matriz recibida debe ser un arreglo no vacío de arreglos numéricos.");
  }

  const rows = matrix.length;
  const cols = matrix[0]?.length;

  if (typeof cols !== "number" || cols === 0) {
    throw new Error("La matriz no puede contener filas vacías.");
  }

  for (let i = 0; i < rows; i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) {
      throw new Error(`La fila en el índice ${i} no es un arreglo válido.`);
    }

    if (row.length !== cols) {
      throw new Error(
        `Asimetría dimensional detectada: La fila ${i} tiene ${row.length} columnas, se esperaban ${cols}.`
      );
    }

    for (let j = 0; j < cols; j++) {
      const val = row[j];
      if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
        throw new Error(
          `Valor numérico inválido en la posición [${i}][${j}]: los elementos deben ser números finitos float64.`
        );
      }
    }
  }

  if (rows < cols) {
    throw new Error(
      `Restricción matemática QR: La matriz debe ser alta o cuadrada (filas m=${rows} >= columnas n=${cols}).`
    );
  }
}
