export const INPUT_TABS = {
  GRID: 'grid',
  TEXT: 'text',
  JSON: 'json',
} as const;

export type InputTab = (typeof INPUT_TABS)[keyof typeof INPUT_TABS];

export const MATRIX_DIMENSIONS = {
  MIN: 1,
  MAX: 30,
  DEFAULT_ROWS: 3,
  DEFAULT_COLS: 3,
} as const;

export const QUICK_TEMPLATES = [
  { label: '2×2', rows: 2, cols: 2 },
  { label: '3×3', rows: 3, cols: 3 },
  { label: '4×4', rows: 4, cols: 4 },
  { label: '5×3', rows: 5, cols: 3 },
  { label: '6×6', rows: 6, cols: 6 },
] as const;

export const MATRIX_DEFAULTS = {
  TEXT_INPUT: '12, -51, 4\n6, 167, -68\n-4, 24, -41',
  JSON_INPUT: JSON.stringify(
    [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41],
    ],
    null,
    2
  ),
  EMPTY_JSON: '[\n  []\n]',
} as const;

export const MATRIX_MESSAGES = {
  INVALID_FORMAT:
    'El formato de la matriz es inválido. Verifique que no haya celdas vacías o valores no numéricos.',
  UNEQUAL_COLUMNS: 'Todas las filas deben tener la misma cantidad de columnas.',
  JSON_STRUCTURE_ERROR:
    'El JSON debe ser un array de arrays de números. Ej: [[1,2],[3,4]]',
  JSON_SYNTAX_ERROR_PREFIX: 'JSON inválido: ',
} as const;

export const MATRIX_INPUT_TEXT = {
  TITLE: 'Configuración de Matriz',
  DESC: 'Ingrese los datos de la matriz para ejecutar la descomposición QR',
  QUICK_TEMPLATES_LABEL: 'Plantillas rápidas',
  TAB_GRID: 'Cuadrícula interactiva',
  TAB_TEXT: 'Texto libre',
  TAB_JSON: 'JSON directo',
  ROWS_LABEL: 'Filas',
  COLS_LABEL: 'Columnas',
  FILL_RANDOM_BTN: 'Rellenar aleatorio',
  CLEAR_BTN: 'Borrar datos',
  GRID_EMPTY_HINT:
    'Configure las dimensiones y haga clic en Generar cuadrícula.',
  TEXT_LABEL:
    'Filas separadas por salto de línea, valores por coma o espacio',
  JSON_LABEL: 'Array de arrays de números en formato JSON',
  SUBMIT_BTN: 'Ejecutar descomposición QR',
  PROCESSING_BTN: 'Procesando matriz...',
} as const;
