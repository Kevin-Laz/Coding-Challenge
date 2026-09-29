import {
  Component,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import {
  AUTH_MODAL_DEFAULTS,
  AUTH_MODAL_TEXT,
} from './constants/auth-modal.constants';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthModalComponent {
  readonly api = inject(ApiService);
  readonly text = AUTH_MODAL_TEXT;

  readonly visible = input<boolean>(false);
  readonly close = output<void>();

  readonly username = signal<string>(AUTH_MODAL_DEFAULTS.USERNAME);
  readonly password = signal<string>(AUTH_MODAL_DEFAULTS.PASSWORD);
  readonly isLoading = signal<boolean>(false);

  onClose(): void {
    this.close.emit();
  }

  async onLogin(): Promise<void> {
    this.isLoading.set(true);
    const ok = await this.api.login(this.username(), this.password());
    this.isLoading.set(false);
    if (ok) {
      this.close.emit();
    }
  }
}
