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
import {
  API_ENDPOINTS,
  GLOBAL_MESSAGES,
  HEALTH_CHECK_INTERVAL_MS,
  HTTP_HEADERS,
  SERVICE_NAMES,
  STORAGE_KEYS,
} from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  // URLs obtenidas de la configuración del entorno (Local vs Render Producción)
  readonly gatewayUrl = signal<string>(environment.gatewayUrl);
  readonly goServiceUrl = signal<string>(environment.goServiceUrl);

  // Token JWT en memoria / reactivo con Signals
  readonly token = signal<string | null>(
    localStorage.getItem(STORAGE_KEYS.JWT_TOKEN)
  );

  // Estados de salud de los microservicios
  readonly gatewayHealth = signal<ServiceHealthStatus>({
    service: SERVICE_NAMES.GATEWAY,
    status: 'unknown',
    lastChecked: '-',
  });

  readonly goHealth = signal<ServiceHealthStatus>({
    service: SERVICE_NAMES.QR_ENGINE,
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
    // Programar comprobación periódica
    setInterval(() => {
      this.checkHealth();
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  setToken(token: string | null): void {
    this.token.set(token);
    if (token) {
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    this.errorMessage.set(null);
    try {
      const res = await firstValueFrom(
        this.http.post<LoginResponse>(
          `${this.gatewayUrl()}${API_ENDPOINTS.AUTH_LOGIN}`,
          {
            username,
            password,
          }
        )
      );
      this.setToken(res.token);
      return true;
    } catch (err: unknown) {
      const msg = this.extractErrorMessage(err);
      this.errorMessage.set(`${GLOBAL_MESSAGES.AUTH_FAILED_PREFIX}${msg}`);
      return false;
    }
  }

  async checkHealth(): Promise<void> {
    // 1. Check Gateway Node
    const startGateway = performance.now();
    try {
      await firstValueFrom(
        this.http.get<{ status: string; service: string }>(
          `${this.gatewayUrl()}${API_ENDPOINTS.HEALTH}`
        )
      );
      this.gatewayHealth.set({
        service: SERVICE_NAMES.GATEWAY,
        status: 'healthy',
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: Math.round(performance.now() - startGateway),
      });
    } catch {
      this.gatewayHealth.set({
        service: SERVICE_NAMES.GATEWAY,
        status: 'unhealthy',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }

    // 2. Check Go Service
    const startGo = performance.now();
    try {
      await firstValueFrom(
        this.http.get<{ status: string; service: string }>(
          `${this.goServiceUrl()}${API_ENDPOINTS.HEALTH}`
        )
      );
      this.goHealth.set({
        service: SERVICE_NAMES.QR_ENGINE,
        status: 'healthy',
        lastChecked: new Date().toLocaleTimeString(),
        latencyMs: Math.round(performance.now() - startGo),
      });
    } catch {
      this.goHealth.set({
        service: SERVICE_NAMES.QR_ENGINE,
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
      headers = headers.set(
        HTTP_HEADERS.AUTHORIZATION,
        `${HTTP_HEADERS.BEARER_PREFIX}${currentToken}`
      );
    }

    try {
      const response = await firstValueFrom(
        this.http.post<ProcessedMatrixResponse>(
          `${this.gatewayUrl()}${API_ENDPOINTS.PROCESS}`,
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
      const httpError = err as {
        error?: { error?: string; details?: string };
        message?: string;
      };
      if (httpError.error?.error) {
        return httpError.error.details
          ? `${httpError.error.error} (${httpError.error.details})`
          : httpError.error.error;
      }
      if (httpError.message) return httpError.message;
    }
    return GLOBAL_MESSAGES.NETWORK_OR_SERVER_ERROR;
  }
}
