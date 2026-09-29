import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-result-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultPanelComponent {
  readonly api = inject(ApiService);

  readonly conditionNumber = computed(() => {
    const res = this.api.result();
    if (!res) return null;
    const r = res.qrResult.r;
    let maxDiag = -Infinity;
    let minDiag = Infinity;
    for (let i = 0; i < r.length; i++) {
      const d = Math.abs(r[i][i]);
      if (d > maxDiag) maxDiag = d;
      if (d < minDiag) minDiag = d;
    }
    return minDiag > 0 ? (maxDiag / minDiag).toFixed(4) : 'Infinito (Singular)';
  });

  readonly sparsityQ = computed(() => {
    const res = this.api.result();
    if (!res) return null;
    const q = res.qrResult.q;
    const rows = q.length;
    const cols = q[0]?.length ?? 0;
    let zeros = 0;
    for (const row of q) {
      for (const v of row) {
        if (Math.abs(v) < 1e-10) zeros++;
      }
    }
    return rows * cols > 0 ? ((zeros / (rows * cols)) * 100).toFixed(1) : '0.0';
  });
}
