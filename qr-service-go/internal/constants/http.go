package constants

// HTTP routes and route groups.
const (
	RouteHealth          = "/health"
	RouteGroupQR         = "/qr"
	RouteQRDecompose     = "/decompose"
	RouteFullQRDecompose = "/qr/decompose"
)

// HTTP response field values.
const (
	HealthStatusHealthy = "healthy"
	HealthServiceName   = "qr-service-go"
)

// HTTP error descriptions returned in JSON payloads.
const (
	ErrMalformedJSONMsg   = "JSON malformado o inválido"
	ErrInvalidMatrixMsg   = "Matriz con dimensiones o formato inválido"
	ErrInternalProcessMsg = "Error interno durante el procesamiento de la matriz"
)
