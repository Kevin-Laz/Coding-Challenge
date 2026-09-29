package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"qr-service-go/internal/constants"
)

/*
 * ============================================================================
 * ENRUTADOR Y MIDDLEWARES: Configuración del Router HTTP en Fiber
 * ============================================================================
 * 
 * Middlewares incluidos:
 * 1. recover.New(): Protege el proceso contra pánicos imprevistos en runtime. Si ocurriera
 *    un desbordamiento de índice en cálculos matriciales, el servidor captura el error y
 *    devuelve un HTTP 500 sin caerse.
 * 2. logger.New(): Registra el throughput, latencia y status HTTP de cada request.
 * ============================================================================
 */

// SetupRoutes declara la jerarquía de rutas y conecta los middlewares del servidor Fiber.
func SetupRoutes(app *fiber.App, handler *QRHandler) {
	// Middlewares globales
	app.Use(recover.New())
	app.Use(logger.New())

	// Endpoint de comprobación de salud del contenedor/microservicio
	app.Get(constants.RouteHealth, func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  constants.HealthStatusHealthy,
			"service": constants.HealthServiceName,
		})
	})

	// Agrupamiento y definición de rutas del dominio QR
	qrGroup := app.Group(constants.RouteGroupQR)
	qrGroup.Post(constants.RouteQRDecompose, handler.HandleDecompose)
}
