export type Matrix2D = number[][];

export interface MatrixDimensions {
  readonly rows: number;
  readonly cols: number;
}

export interface MatrixStats {
  readonly mean: number;
  readonly frobeniusNorm: number;
  readonly min: number;
  readonly max: number;
  readonly sum: number;
}

export interface ProcessedMatrixResponse {
  readonly dimensions: MatrixDimensions;
  readonly originalStats: MatrixStats;
  readonly qrResult: {
    readonly q: Matrix2D;
    readonly r: Matrix2D;
    readonly qStats: MatrixStats;
    readonly rStats: MatrixStats;
    readonly reconstructionErrorFrobenius: number;
  };
  readonly timing: {
    readonly goExecutionMs: number;
    readonly totalOrchestrationMs: number;
  };
}

export interface ServiceHealthStatus {
  readonly service: string;
  readonly status: 'healthy' | 'unhealthy' | 'checking' | 'unknown';
  readonly lastChecked: string;
  readonly latencyMs?: number;
}

export interface LoginResponse {
  readonly message: string;
  readonly token: string;
  readonly tokenType: string;
  readonly expiresIn: string;
}
