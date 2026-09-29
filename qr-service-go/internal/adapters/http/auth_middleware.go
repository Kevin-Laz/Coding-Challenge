package http

import (
	"os"

	"github.com/gofiber/fiber/v2"

	"qr-service-go/internal/constants"
)

// InternalAuthMiddleware valida que las solicitudes a rutas privadas de Go
// provengan exclusivamente del API Gateway verificado a través del header x-internal-api-key.
func InternalAuthMiddleware() fiber.Handler {
	expectedKey := os.Getenv("INTERNAL_API_KEY")
	if expectedKey == "" {
		expectedKey = constants.DefaultInternalKey
	}

	return func(c *fiber.Ctx) error {
		providedKey := c.Get(constants.HeaderInternalAPIKey)
		if providedKey == "" || providedKey != expectedKey {
			return c.Status(fiber.StatusUnauthorized).JSON(ErrorDTO{
				Error:   constants.ErrUnauthorizedKeyMsg,
				Details: "Esta ruta de cálculo matemático requiere autenticación interna inter-servicios.",
			})
		}
		return c.Next()
	}
}
