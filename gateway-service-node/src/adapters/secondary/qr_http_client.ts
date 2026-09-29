/*
 * ============================================================================
 * ADAPTADOR SECUNDARIO (Outbound Adapter): Cliente HTTP Nativo para Go Service
 * ============================================================================
 * 
 * Este adaptador implementa el puerto `IQRClientPort`.
 * 
 * Fetch nativo de Node.js (v18+) en lugar de Axios:
 * 1. Cero Dependencias Externas: Reducimos la superficie de vulnerabilidades en package.json.
 * 2. Rendimiento Directo: El motor V8 de Node ejecuta `fetch` sobre HTTP/1.1 y HTTP/2
 *    con binding nativo a libuv.
 * 3. Tolerancia a Fallos y Timeouts: Implementamos `AbortController` para cancelar peticiones
 *    colgadas si el microservicio de Go tarda más del tiempo límite (Timeout).
 * ============================================================================
 */

import { Matrix2D, QRDecompositionResponse } from "../../core/domain/matrix";
import { IQRClientPort } from "../../core/ports/qr_client.port";

export class QRHttpClientAdapter implements IQRClientPort {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    baseUrl: string = process.env.QR_SERVICE_URL || "http://localhost:8080/qr/decompose",
    timeoutMs: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  public async decomposeMatrix(matrix: Matrix2D): Promise<QRDecompositionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ matrix }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `El servicio QR en Go devolvió un status ${response.status}: ${errorText}`
        );
      }

      const data = (await response.json()) as QRDecompositionResponse;
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            `Timeout de red (${this.timeoutMs}ms) al comunicarse con el microservicio QR en Go.`
          );
        }
        throw new Error(`Falla en la comunicación con Go QR Service: ${error.message}`);
      }
      throw new Error("Error desconocido al invocar el microservicio externo QR.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
