package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
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
 * 1. cors.New(): Habilita solicitudes Cross-Origin (CORS) desde clientes web/SPA.
 * 2. recover.New(): Protege el proceso contra pánicos imprevistos en runtime. Si ocurriera
 *    un desbordamiento de índice en cálculos matriciales, el servidor captura el error y
 *    devuelve un HTTP 500 sin caerse.
 * 3. logger.New(): Registra el throughput, latencia y status HTTP de cada request.
 * ============================================================================
 */

// SetupRoutes declara la jerarquía de rutas y conecta los middlewares del servidor Fiber.
func SetupRoutes(app *fiber.App, handler *QRHandler) {
	// Middlewares globales
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, x-internal-api-key",
		AllowMethods: "GET, POST, OPTIONS",
	}))
	app.Use(recover.New())
	app.Use(logger.New())

	// Endpoint público: Comprobación de salud del contenedor/microservicio (para pings y monitoreo)
	app.Get(constants.RouteHealth, func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  constants.HealthStatusHealthy,
			"service": constants.HealthServiceName,
		})
	})

	// Agrupamiento y definición de rutas del dominio QR
	// Ruta privada protegida con InternalAuthMiddleware (solo el Gateway con el header interno puede consumirla)
	qrGroup := app.Group(constants.RouteGroupQR)
	qrGroup.Post(constants.RouteQRDecompose, InternalAuthMiddleware(), handler.HandleDecompose)
}
