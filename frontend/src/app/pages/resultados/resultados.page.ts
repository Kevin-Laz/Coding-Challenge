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

@Component({
  selector: 'app-resultados-page',
  standalone: true,
  imports: [CommonModule, ResultPanelComponent],
  template: `
    <div class="page-container">
      <div class="page-nav">
        <button class="btn btn-secondary back-btn" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Nueva Matriz / Volver a entrada
        </button>

        @if (api.result()) {
          <div class="result-badge">
            Matriz {{ api.result()?.dimensions?.rows }} × {{ api.result()?.dimensions?.cols }}
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
      gap: 0.5rem;
      font-size: 0.875rem;
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
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
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

  ngOnInit(): void {
    // Si el usuario entra directamente a /resultados sin haber procesado nada
    if (!this.api.result() && !this.api.isProcessing()) {
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
