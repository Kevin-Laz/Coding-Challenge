import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { HeaderComponent } from './components/header/header.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    AuthModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly api = inject(ApiService);

  onError(msg: string | null): void {
    this.api.errorMessage.set(msg);
  }

  onLogout(): void {
    this.api.setToken(null);
  }

  onCheckHealth(): void {
    this.api.checkHealth();
  }
}
