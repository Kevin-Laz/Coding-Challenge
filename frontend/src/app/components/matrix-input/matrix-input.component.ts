import {
  Component,
  computed,
  signal,
  input,
  output,
  ElementRef,
  viewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Matrix2D } from '../../models/matrix.models';

type InputTab = 'grid' | 'text' | 'json';

@Component({
  selector: 'app-matrix-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matrix-input.component.html',
  styleUrl: './matrix-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixInputComponent {
  readonly isProcessing = input<boolean>(false);
  readonly submitMatrix = output<Matrix2D>();
  readonly errorChange = output<string | null>();

  // Referencias a las celdas del grid para enfocar con flechas/enter
  readonly cellInputs = viewChildren<ElementRef<HTMLInputElement>>('cellInput');

  // Tab activo
  readonly activeTab = signal<InputTab>('grid');

  // --- Tab: Grid interactivo ---
  readonly gridRows = signal<number>(3);
  readonly gridCols = signal<number>(3);

  // Valores de las celdas como matriz de strings
  readonly cellValues = signal<string[][]>(
    this.buildEmptyGrid(3, 3)
  );

  // --- Tab: Texto libre ---
  readonly textInput = signal<string>('12, -51, 4\n6, 167, -68\n-4, 24, -41');

  // --- Tab: JSON ---
  readonly jsonInput = signal<string>(
    JSON.stringify([[12, -51, 4], [6, 167, -68], [-4, 24, -41]], null, 2)
  );

  readonly jsonError = signal<string | null>(null);

  // Computed: filas del grid (para iteración en template)
  readonly gridRowsArray = computed(() =>
    Array.from({ length: this.gridRows() }, (_, i) => i)
  );

  readonly gridColsArray = computed(() =>
    Array.from({ length: this.gridCols() }, (_, i) => i)
  );

  // Plantillas rápidas
  readonly quickTemplates = [
    { label: '2×2', rows: 2, cols: 2 },
    { label: '3×3', rows: 3, cols: 3 },
    { label: '4×4', rows: 4, cols: 4 },
    { label: '5×3', rows: 5, cols: 3 },
    { label: '6×6', rows: 6, cols: 6 },
  ];

  setTab(tab: InputTab): void {
    this.activeTab.set(tab);
  }

  setGridRows(val: number): void {
    const rows = Math.max(1, Math.min(30, val || 1));
    this.gridRows.set(rows);
    this.rebuildGridPreserving(rows, this.gridCols());
  }

  setGridCols(val: number): void {
    const cols = Math.max(1, Math.min(30, val || 1));
    this.gridCols.set(cols);
    this.rebuildGridPreserving(this.gridRows(), cols);
  }

  clearGrid(): void {
    this.cellValues.set(this.buildEmptyGrid(this.gridRows(), this.gridCols()));
    this.textInput.set('');
    this.jsonInput.set('[\n  []\n]');
    this.errorChange.emit(null);
  }

  private rebuildGridPreserving(newRows: number, newCols: number): void {
    const old = this.cellValues();
    const next: string[][] = [];
    for (let r = 0; r < newRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < newCols; c++) {
        row.push(old[r]?.[c] ?? '');
      }
      next.push(row);
    }
    this.cellValues.set(next);
  }

  applyTemplate(rows: number, cols: number): void {
    this.gridRows.set(rows);
    this.gridCols.set(cols);
    this.cellValues.set(this.buildEmptyGrid(rows, cols));
    this.activeTab.set('grid');
  }

  fillRandomGrid(): void {
    const rows = this.gridRows();
    const cols = this.gridCols();
    const grid: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(String(Math.floor(Math.random() * 200) - 50));
      }
      grid.push(row);
    }
    this.cellValues.set(grid);
  }

  updateCell(row: number, col: number, value: string): void {
    const current = this.cellValues().map((r) => [...r]);
    current[row][col] = value;
    this.cellValues.set(current);
  }

  getCellValue(row: number, col: number): string {
    return this.cellValues()[row]?.[col] ?? '';
  }

  isCellInvalid(row: number, col: number): boolean {
    const val = this.cellValues()[row]?.[col]?.trim();
    if (!val) return false; // celda vacía no se pinta de rojo hasta submit
    return isNaN(Number(val));
  }

  onCellKeydown(event: KeyboardEvent, row: number, col: number): void {
    const rows = this.gridRows();
    const cols = this.gridCols();

    let targetRow = row;
    let targetCol = col;

    if (event.key === 'Enter') {
      event.preventDefault();
      // Pasar a la siguiente celda (fila siguiente o siguiente columna)
      if (col + 1 < cols) {
        targetCol = col + 1;
      } else if (row + 1 < rows) {
        targetRow = row + 1;
        targetCol = 0;
      }
      this.focusCell(targetRow, targetCol);
    } else if (event.key === 'ArrowRight') {
      const input = event.target as HTMLInputElement;
      if (input.selectionStart === input.value.length || event.ctrlKey || event.altKey) {
        if (col + 1 < cols) {
          event.preventDefault();
          this.focusCell(row, col + 1);
        }
      }
    } else if (event.key === 'ArrowLeft') {
      const input = event.target as HTMLInputElement;
      if (input.selectionStart === 0 || event.ctrlKey || event.altKey) {
        if (col - 1 >= 0) {
          event.preventDefault();
          this.focusCell(row, col - 1);
        }
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (row + 1 < rows) {
        this.focusCell(row + 1, col);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (row - 1 >= 0) {
        this.focusCell(row - 1, col);
      }
    }
  }

  private focusCell(row: number, col: number): void {
    const cols = this.gridCols();
    const index = row * cols + col;
    const inputs = this.cellInputs();
    if (inputs && inputs[index]) {
      inputs[index].nativeElement.focus();
      inputs[index].nativeElement.select();
    }
  }

  onSubmit(): void {
    const tab = this.activeTab();
    let matrix: Matrix2D | null = null;

    if (tab === 'grid') {
      matrix = this.parseGrid();
    } else if (tab === 'text') {
      matrix = this.parseText(this.textInput());
    } else if (tab === 'json') {
      matrix = this.parseJson(this.jsonInput());
      if (!matrix) return;
    }

    if (!matrix) {
      this.errorChange.emit('El formato de la matriz es inválido. Verifique que no haya celdas vacías o valores no numéricos.');
      return;
    }

    if (!this.validateMatrixShape(matrix)) {
      this.errorChange.emit('Todas las filas deben tener la misma cantidad de columnas.');
      return;
    }

    this.errorChange.emit(null);
    this.submitMatrix.emit(matrix);
  }

  private buildEmptyGrid(rows: number, cols: number): string[][] {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => '')
    );
  }

  private parseGrid(): Matrix2D | null {
    const cells = this.cellValues();
    const matrix: number[][] = [];

    for (const row of cells) {
      const nums: number[] = [];
      for (const cell of row) {
        const n = Number(cell.trim());
        if (cell.trim() === '' || isNaN(n)) return null;
        nums.push(n);
      }
      matrix.push(nums);
    }

    return matrix;
  }

  private parseText(text: string): Matrix2D | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
    const matrix: number[][] = [];

    for (const line of lines) {
      const nums = line
        .split(/[,\s]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .map(Number);

      if (nums.some((n) => isNaN(n))) return null;
      matrix.push(nums);
    }

    return matrix;
  }

  private parseJson(json: string): Matrix2D | null {
    this.jsonError.set(null);
    try {
      const parsed = JSON.parse(json);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (row) =>
            Array.isArray(row) &&
            row.every((v) => typeof v === 'number')
        )
      ) {
        const err = 'El JSON debe ser un array de arrays de números. Ej: [[1,2],[3,4]]';
        this.jsonError.set(err);
        this.errorChange.emit(err);
        return null;
      }
      return parsed as Matrix2D;
    } catch (e) {
      const err = 'JSON inválido: ' + (e instanceof Error ? e.message : String(e));
      this.jsonError.set(err);
      this.errorChange.emit(err);
      return null;
    }
  }

  private validateMatrixShape(matrix: Matrix2D): boolean {
    if (matrix.length === 0) return false;
    const cols = matrix[0].length;
    return matrix.every((row) => row.length === cols) && cols > 0;
  }
}
