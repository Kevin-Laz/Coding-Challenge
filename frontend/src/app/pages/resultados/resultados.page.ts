import {
  Component,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ResultPanelComponent } from '../../components/result-panel/result-panel.component';
import { APP_ROUTES } from '../../constants';
import { RESULTADOS_PAGE_TEXT } from './constants/resultados.constants';

@Component({
  selector: 'app-resultados-page',
  standalone: true,
  imports: [CommonModule, ResultPanelComponent],
  template: `
    <div class="page-container">
      <div class="page-nav">
        <button class="btn btn-outline back-btn" (click)="goBack()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ text.BACK_BUTTON }}
        </button>

        @if (api.result()) {
          <div class="result-badge">
            {{ text.MATRIX_BADGE_PREFIX }} {{ api.result()?.dimensions?.rows }} × {{ api.result()?.dimensions?.cols }}
          </div>
        }
      </div>

      <div class="results-wrapper">
        <app-result-panel />
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .page-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      font-weight: 500;
      min-width: 110px;
      justify-content: center;
      padding: 0.5rem 1rem;
    }

    .result-badge {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-primary);
      background: var(--color-primary-dim);
      border: 1px solid rgba(129, 140, 248, 0.25);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
    }

    .results-wrapper {
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadosPage implements OnInit {
  readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly text = RESULTADOS_PAGE_TEXT;

  ngOnInit(): void {
    // Si el usuario entra directamente a /resultados sin haber procesado nada
    if (!this.api.result() && !this.api.isProcessing()) {
      this.router.navigate([APP_ROUTES.HOME]);
    }
  }

  goBack(): void {
    this.router.navigate([APP_ROUTES.HOME]);
  }
}
