import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Matrix2D } from './models/matrix.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly api = inject(ApiService);

  // Formulario y configuración de matriz
  readonly matrixRows = signal<number>(3);
  readonly matrixCols = signal<number>(3);
  readonly matrixInputText = signal<string>(
    '12, -51, 4\n6, 167, -68\n-4, 24, -41'
  );

  // Credenciales de login
  readonly username = signal<string>('admin');
  readonly password = signal<string>('secretpassword123');
  readonly showAuthModal = signal<boolean>(false);

  // Estadísticas derivadas calculadas localmente sobre el resultado
  readonly conditionNumberEstimate = computed(() => {
    const res = this.api.result();
    if (!res) return null;
    const r = res.qrResult.r;
    let maxDiag = -Infinity;
    let minDiag = Infinity;
    for (let i = 0; i < r.length; i++) {
      const diagVal = Math.abs(r[i][i]);
      if (diagVal > maxDiag) maxDiag = diagVal;
      if (diagVal < minDiag) minDiag = diagVal;
    }
    return minDiag > 0 ? (maxDiag / minDiag).toFixed(4) : 'Infinito (Singular)';
  });

  readonly sparsityPercentage = computed(() => {
    const res = this.api.result();
    if (!res) return null;
    const q = res.qrResult.q;
    const rows = q.length;
    const cols = q[0].length;
    let zeroCount = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.abs(q[i][j]) < 1e-10) zeroCount++;
      }
    }
    return (((zeroCount) / (rows * cols)) * 100).toFixed(2);
  });

  generateRandomMatrix(rows: number, cols: number): void {
    const matrix: number[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        // Enteros entre -50 y 150
        row.push(Math.floor(Math.random() * 200) - 50);
      }
      matrix.push(row);
    }
    this.matrixInputText.set(
      matrix.map((r) => r.join(', ')).join('\n')
    );
  }

  parseMatrixFromInput(): Matrix2D | null {
    const text = this.matrixInputText().trim();
    if (!text) return null;

    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    const matrix: number[][] = [];

    for (const line of lines) {
      const nums = line
        .split(/[,\s]+/)
        .map((val) => val.trim())
        .filter((val) => val.length > 0)
        .map(Number);

      if (nums.some((n) => isNaN(n))) {
        return null;
      }
      matrix.push(nums);
    }
    return matrix;
  }

  onSubmitProcess(): void {
    const matrix = this.parseMatrixFromInput();
    if (!matrix) {
      this.api.errorMessage.set(
        'El formato de la matriz es inválido. Ingrese filas separadas por saltos de línea y números por comas o espacios.'
      );
      return;
    }
    this.api.processMatrix(matrix);
  }

  onLogin(): void {
    this.api.login(this.username(), this.password()).then((ok) => {
      if (ok) {
        this.showAuthModal.set(false);
      }
    });
  }

  onLogout(): void {
    this.api.setToken(null);
  }

  refreshHealth(): void {
    this.api.checkHealth();
  }
}
