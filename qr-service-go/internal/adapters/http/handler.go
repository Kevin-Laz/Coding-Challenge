package http

import (
	"errors"
	"net/http"

	"github.com/gofiber/fiber/v2"

	"qr-service-go/internal/constants"
	"qr-service-go/internal/core/domain"
	"qr-service-go/internal/core/ports"
)

/*
 * ============================================================================
 * ADAPTADOR HTTP PRIMARIO: Controlador Fiber de Descomposición QR
 * ============================================================================
 * 
 * Este adaptador se encarga de convertir el protocolo HTTP (mensajes JSON, cabeceras, códigos HTTP)
 * hacia llamadas nativas del núcleo del dominio.
 * 
 * ¿Por qué usamos Data Transfer Objects (DTOs) separados y no la entidad 'domain.Matrix' directamente en la firma del BodyParser?
 * 1. Desacoplamiento de Transporte: La estructura del JSON externo puede variar (ej. renombrar campos)
 *    sin obligar a modificar el objeto de dominio interno.
 * 2. Manejo Seguro de Errores: Fiber desglosa el payload y nosotros aislamos el parseo JSON de la lógica de negocio.
 * 3. Mapeo Semántico de Códigos HTTP: Mapeamos errores de dominio (ej. ErrInsufficientRows, ErrNonRectangular)
 *    a respuestas 400 Bad Request con explicaciones estructuradas.
 * ============================================================================
 */

// QRHandler maneja las peticiones HTTP entrantes y delega la ejecución al puerto QRDecomposer.
type QRHandler struct {
	service ports.QRDecomposer
}

// NewQRHandler instancia el controlador inyectando la implementación de la interfaz de puerto.
func NewQRHandler(service ports.QRDecomposer) *QRHandler {
	return &QRHandler{
		service: service,
	}
}

// RequestDTO representa el contrato JSON de entrada recibido por el cliente HTTP.
type RequestDTO struct {
	Matrix [][]float64 `json:"matrix"`
}

// ErrorDTO encapsula una respuesta de error estandarizada para la API.
type ErrorDTO struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}

// HandleDecompose procesa la ruta POST /qr/decompose.
func (h *QRHandler) HandleDecompose(c *fiber.Ctx) error {
	var req RequestDTO
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(ErrorDTO{
			Error:   constants.ErrMalformedJSONMsg,
			Details: err.Error(),
		})
	}

	matrix := domain.Matrix(req.Matrix)

	result, err := h.service.Decompose(c.UserContext(), matrix)
	if err != nil {
		// Mapeo exhaustivo de errores de dominio a códigos HTTP
		switch {
		case errors.Is(err, domain.ErrEmptyMatrix),
			errors.Is(err, domain.ErrInvalidDimensions),
			errors.Is(err, domain.ErrNonRectangular),
			errors.Is(err, domain.ErrInsufficientRows):
			return c.Status(http.StatusBadRequest).JSON(ErrorDTO{
				Error:   constants.ErrInvalidMatrixMsg,
				Details: err.Error(),
			})
		default:
			return c.Status(http.StatusInternalServerError).JSON(ErrorDTO{
				Error:   constants.ErrInternalProcessMsg,
				Details: err.Error(),
			})
		}
	}

	return c.Status(http.StatusOK).JSON(result)
}
