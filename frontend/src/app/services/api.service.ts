import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoginResponse,
  Matrix2D,
  ProcessedMatrixResponse,
  ServiceHealthStatus,
} from '../models/matrix.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // URLs obtenidas de la configuración del entorno (Local vs Render Producción)
  readonly gatewayUrl = signal<string>(environment.gatewayUrl);
  readonly goServiceUrl = signal<string>(environment.goServiceUrl);

  // Token JWT en memoria / reactivo con Signals
  readonly token = signal<string | null>(localStorage.getItem('qr_jwt_token'));

  // Estados de salud de los microservicios
  readonly gatewayHealth = signal<ServiceHealthStatus>({
    service: 'Gateway (Node.js)',
    status: 'unknown',
    lastChecked: '-',
  });

  readonly goHealth = signal<ServiceHealthStatus>({
    service: 'QR Engine (Go)',
    status: 'unknown',
    lastChecked: '-',
  });

  // Estado de procesamiento
  readonly isProcessing = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<ProcessedMatrixResponse | null>(null);
  readonly authModalRequested = signal<boolean>(false);

  requestAuthModal(): void {
    this.authModalRequested.set(true);
  }

  constructor() {
    // Comprobar salud inmediatamente al cargar
    this.checkHealth();
    // Programar comprobación periódica cada 5 minutos (300.000 ms)
    setInterval(() => {
      this.checkHealth();
    }, 5 * 60 * 1000);
  }

  setToken(token: string | null): void {
    this.token.set(token);
    if (token) {
      localStorage.setItem('qr_jwt_token', token);
    } else {
      localStorage.removeItem('qr_jwt_token');
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    this.errorMessage.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.gatewayUrl()}/auth/login`, {
          username,
          password,
        })
      );
      this.setToken(res.token);
      return true;
    } catch (err: unknown) {
      const msg = this.extractErrorMessage(err);
      this.errorMessage.set(`Fallo de autenticación: ${msg}`);
      return false;
    }
  }

  async checkHealth(): Promise<void> {
    // 1. Check Gateway Node
    const startGateway = performance.now();
    try {
      await firstValueFrom(
        this.http.get<{ status: string; service: string }>(
          `${this.gatewayUrl()}/health`
        )
      );
      this.gatewayHealth.set({
        service: 'Gateway (Node.js)',
        status: 'healthy',
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: Math.round(performance.now() - startGateway),
      });
    } catch {
      this.gatewayHealth.set({
        service: 'Gateway (Node.js)',
        status: 'unhealthy',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }

    // 2. Check Go Service
    const startGo = performance.now();
    try {
      await firstValueFrom(
        this.http.get<{ status: string; service: string }>(
          `${this.goServiceUrl()}/health`
        )
      );
      this.goHealth.set({
        service: 'QR Engine (Go)',
        status: 'healthy',
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: Math.round(performance.now() - startGo),
      });
    } catch {
      this.goHealth.set({
        service: 'QR Engine (Go)',
        status: 'unhealthy',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  }

  async processMatrix(matrix: Matrix2D): Promise<void> {
    this.isProcessing.set(true);
    this.result.set(null);
    this.errorMessage.set(null);

    const currentToken = this.token();
    let headers = new HttpHeaders();
    if (currentToken) {
      headers = headers.set('Authorization', `Bearer ${currentToken}`);
    }

    try {
      const response = await firstValueFrom(
        this.http.post<ProcessedMatrixResponse>(
          `${this.gatewayUrl()}/process`,
          { matrix },
          { headers }
        )
      );
      this.result.set(response);
    } catch (err: unknown) {
      const msg = this.extractErrorMessage(err);
      this.errorMessage.set(msg);
      this.result.set(null);
    } finally {
      this.isProcessing.set(false);
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const httpError = err as { error?: { error?: string; details?: string }; message?: string };
      if (httpError.error?.error) {
        return httpError.error.details
          ? `${httpError.error.error} (${httpError.error.details})`
          : httpError.error.error;
      }
      if (httpError.message) return httpError.message;
    }
    return 'Error de red o servidor no disponible';
  }
}
