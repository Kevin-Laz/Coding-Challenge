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
import { CLIENT_CONSTANTS } from "../../constants/client.constants";

export class QRHttpClientAdapter implements IQRClientPort {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    baseUrl: string = process.env.QR_SERVICE_URL ||
      CLIENT_CONSTANTS.QR_SERVICE.DEFAULT_BASE_URL,
    timeoutMs: number = CLIENT_CONSTANTS.QR_SERVICE.DEFAULT_TIMEOUT_MS
  ) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  public async decomposeMatrix(matrix: Matrix2D): Promise<QRDecompositionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.baseUrl, {
        method: CLIENT_CONSTANTS.QR_SERVICE.METHOD,
        headers: {
          "Content-Type": CLIENT_CONSTANTS.QR_SERVICE.CONTENT_TYPE_JSON,
          "Accept": CLIENT_CONSTANTS.QR_SERVICE.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify({ matrix }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          CLIENT_CONSTANTS.QR_SERVICE.ERRORS.SERVICE_STATUS(
            response.status,
            errorText
          )
        );
      }

      const data = (await response.json()) as QRDecompositionResponse;
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === CLIENT_CONSTANTS.QR_SERVICE.ABORT_ERROR_NAME) {
          throw new Error(
            CLIENT_CONSTANTS.QR_SERVICE.ERRORS.TIMEOUT(this.timeoutMs)
          );
        }
        throw new Error(
          CLIENT_CONSTANTS.QR_SERVICE.ERRORS.COMMUNICATION_FAILURE(error.message)
        );
      }
      throw new Error(CLIENT_CONSTANTS.QR_SERVICE.ERRORS.UNKNOWN);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
