/*
 * ============================================================================
 * ADAPTADOR PRIMARIO (Inbound Adapter): Controlador Express de Matrices
 * ============================================================================
 * 
 * Este controlador mapea las solicitudes HTTP entrantes hacia el caso de uso `ProcessMatrixUseCase`.
 * 
 * Responsabilidades exclusivas de este controlador:
 * 1. Extraer el body JSON de la petición Express.
 * 2. Delegar la ejecución al caso de uso (sin poner lógica de negocio aquí).
 * 3. Traducir excepciones de dominio o fallas de red en respuestas JSON estructuradas
 *    con los códigos de estado HTTP correctos (400 Bad Request, 502 Bad Gateway, 500 Internal Error).
 * ============================================================================
 */

import { Request, Response } from "express";
import { ProcessMatrixUseCase } from "../../../core/services/process_matrix";

export class MatrixController {
  constructor(private readonly processMatrixUseCase: ProcessMatrixUseCase) {}

  /**
   * Manejador del endpoint POST /process.
   */
  public handleProcess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { matrix } = req.body;

      if (!matrix) {
        res.status(400).json({
          error: "Petición incompleta: El campo 'matrix' es requerido en el cuerpo JSON.",
        });
        return;
      }

      const result = await this.processMatrixUseCase.execute(matrix);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const message = error.message;

        // Identificar si la falla fue de validación matemática (400) o de comunicación HTTP (502)
        if (
          message.includes("La matriz") ||
          message.includes("Restricción matemática") ||
          message.includes("Asimetría dimensional")
        ) {
          res.status(400).json({
            error: "Error de validación dimensional o de dominio matricial",
            details: message,
          });
          return;
        }

        if (message.includes("Falla en la comunicación") || message.includes("Timeout")) {
          res.status(502).json({
            error: "Bad Gateway: Imposible comunicarse con el motor QR de Go",
            details: message,
          });
          return;
        }

        res.status(500).json({
          error: "Error interno del servidor Gateway",
          details: message,
        });
        return;
      }

      res.status(500).json({
        error: "Error no controlado durante el procesamiento",
      });
    }
  };
}
