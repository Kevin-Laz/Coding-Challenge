import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-status-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="status-panel"
      [class.has-error]="errorMessage()"
      role="region"
      aria-live="polite"
      aria-label="Panel de estado del sistema y validaciones"
    >
      @if (errorMessage()) {
        <div class="status-content status-error">
          <div class="status-indicator-dot error-dot" aria-hidden="true"></div>
          <div class="status-text-block">
            <span class="status-label">Validación / Error detectado</span>
            <p class="status-message">{{ errorMessage() }}</p>
          </div>
        </div>
      } @else {
        <div class="status-content status-info">
          <div class="status-indicator-dot info-dot" aria-hidden="true"></div>
          <div class="status-text-block">
            <span class="status-label">Guía de navegación y uso</span>
            <p class="status-message">
              Use las flechas del teclado <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> o la tecla <kbd>Enter</kbd> para desplazarse ágilmente por las celdas. La descomposición QR calculará la matriz ortogonal <strong>Q</strong> y la triangular superior <strong>R</strong>.
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .status-panel {
      min-height: 74px;
      padding: 0.85rem 1.15rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--surface-1);
      display: flex;
      align-items: center;
      transition: background-color 0.2s, border-color 0.2s;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .status-panel.has-error {
      background: var(--color-error-dim);
      border-color: rgba(248, 113, 113, 0.35);
    }

    .status-content {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      width: 100%;
    }

    .status-indicator-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;

      &.info-dot {
        background: var(--color-accent);
        box-shadow: 0 0 6px var(--color-accent-dim);
      }

      &.error-dot {
        background: var(--color-error);
        box-shadow: 0 0 6px var(--color-error-dim);
      }
    }

    .status-text-block {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .status-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-info .status-label {
      color: var(--color-accent);
    }

    .status-error .status-label {
      color: var(--color-error);
    }

    .status-message {
      font-size: 0.82rem;
      line-height: 1.45;
      color: var(--text-primary);
      margin: 0;
    }

    kbd {
      display: inline-block;
      padding: 0.15rem 0.35rem;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      background: var(--surface-3);
      border: 1px solid var(--border-strong);
      border-radius: 4px;
      color: var(--text-primary);
      line-height: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoStatusPanelComponent {
  readonly errorMessage = input<string | null>(null);
}
