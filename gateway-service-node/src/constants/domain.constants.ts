export const DOMAIN_CONSTANTS = {
  ERRORS: {
    EMPTY_MATRIX: "La matriz recibida debe ser un arreglo no vacío de arreglos numéricos.",
    EMPTY_ROW: "La matriz no puede contener filas vacías.",
    INVALID_ROW: (index: number) => `La fila en el índice ${index} no es un arreglo válido.`,
    DIMENSIONAL_ASYMMETRY: (index: number, actualCols: number, expectedCols: number) =>
      `Asimetría dimensional detectada: La fila ${index} tiene ${actualCols} columnas, se esperaban ${expectedCols}.`,
    INVALID_NUMERIC_VALUE: (row: number, col: number) =>
      `Valor numérico inválido en la posición [${row}][${col}]: los elementos deben ser números finitos float64.`,
    QR_RESTRICTION_TALL_OR_SQUARE: (rows: number, cols: number) =>
      `Restricción matemática QR: La matriz debe ser alta o cuadrada (filas m=${rows} >= columnas n=${cols}).`,
  },
} as const;
