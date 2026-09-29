/*
 * ============================================================================
 * PUERTO SALIENTE (Outbound Port): Contrato de Cliente HTTP Externo QR
 * ============================================================================
 * 
 * En Arquitectura Hexagonal, la comunicación con servicios externos se abstrae a través
 * de Puertos de Salida (Outbound Ports).
 * 
 * Beneficios técnicos:
 * 1. Desacoplamiento de Protocolo: El caso de uso ignora si `qr-service-go` corre en localhost,
 *    en Docker, en un clúster de Kubernetes, o si usa HTTP REST o gRPC.
 * 2. Facilidad de Pruebas: Permite inyectar un Mock de IQRClientPort para testear el orquestador
 *    en Node.js sin necesidad de levantar el proceso de Go.
 * ============================================================================
 */

import { Matrix2D, QRDecompositionResponse } from "../domain/matrix";

export interface IQRClientPort {
  /**
   * Realiza la llamada remota al microservicio de Go para factorizar la matriz.
   * @param matrix Matriz de entrada validada m x n.
   * @returns Promesa con la descomposición A = QR y la métrica de tiempo de Go.
   */
  decomposeMatrix(matrix: Matrix2D): Promise<QRDecompositionResponse>;
}
