import {
  Component,
  inject,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { HEADER_TEXT } from './constants/header.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly api = inject(ApiService);
  readonly text = HEADER_TEXT;

  readonly openAuthModal = output<void>();
  readonly logout = output<void>();
  readonly checkHealth = output<void>();

  onOpenAuth(): void {
    this.openAuthModal.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  onCheckHealth(): void {
    this.checkHealth.emit();
  }
}
