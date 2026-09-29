import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Matrix2D } from '../../models/matrix.models';
import { MatrixInputComponent } from '../../components/matrix-input/matrix-input.component';
import { InfoStatusPanelComponent } from '../../components/info-status-panel/info-status-panel.component';

@Component({
  selector: 'app-matriz-page',
  standalone: true,
  imports: [CommonModule, MatrixInputComponent, InfoStatusPanelComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Configuración y Entrada de Matriz</h1>
        <p class="page-desc">
          Configure las dimensiones o pegue los datos para procesar la descomposición QR.
        </p>
      </div>

      <!-- Recuadro estático persistente para mensajes informativos y validaciones -->
      <app-info-status-panel [errorMessage]="api.errorMessage()" />

      <div class="matrix-card">
        <app-matrix-input
          [isProcessing]="api.isProcessing()"
          (submitMatrix)="onMatrixSubmit($event)"
          (errorChange)="onError($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem 1rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-header {
      text-align: center;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }

    .page-desc {
      font-size: 0.88rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .matrix-card {
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrizPage {
  readonly api = inject(ApiService);
  private readonly router = inject(Router);

  async onMatrixSubmit(matrix: Matrix2D): Promise<void> {
    // Si no está autenticado, abrir modal de autenticación
    if (!this.api.token()) {
      this.api.errorMessage.set('Debe iniciar sesión para procesar matrices.');
      this.api.requestAuthModal();
      return;
    }

    // Redirigir de inmediato a /resultados para ver la pantalla de carga
    this.router.navigate(['/resultados']);
    await this.api.processMatrix(matrix);
  }

  onError(msg: string | null): void {
    this.api.errorMessage.set(msg);
  }
}
