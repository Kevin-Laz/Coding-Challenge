/*
 * ============================================================================
 * PUERTO DE SERVICIO: Contrato de Análisis Estadístico y Métricas Algebraicas
 * ============================================================================
 * 
 * Este puerto encapsula las operaciones estadísticas puras sobre las matrices.
 * Separar el cálculo estadístico en su propio servicio/puerto nos permite:
 * 1. Reutilización: Procesar métricas idénticas para A, Q y R de forma uniforme.
 * 2. Mantenibilidad: Modificar o extender algoritmos estadísticos (ej. agregar varianza
 *    o desviación estándar) sin contaminar la lógica de orquestación de red.
 * ============================================================================
 */

import { Matrix2D, MatrixStats } from "../domain/matrix";

export interface IStatsServicePort {
  /**
   * Genera el resumen estadístico numérico (media, norma de Frobenius, valores extremos).
   * @param matrix Matriz bidimensional sobre la cual calcular las métricas.
   */
  calculateStats(matrix: Matrix2D): MatrixStats;

  /**
   * Mide la fidelidad del algoritmo QR calculando el error residual de reconstrucción: ||A - Q * R||_F
   * @param original Matriz A.
   * @param q Matriz ortogonal Q.
   * @param r Matriz triangular superior R.
   * @returns El error escalar absoluto de precisión de punto flotante.
   */
  calculateReconstructionError(
    original: Matrix2D,
    q: Matrix2D,
    r: Matrix2D
  ): number;
}
