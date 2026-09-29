package constants

// Application and Server configuration defaults.
const (
	DefaultPort = "8080"
	AppName     = "Go Fiber QR Engine"
)

// Log messages emitted during application lifecycle.
const (
	LogInitializingServer = "Inicializando Motor Concurrente de Descomposición QR (Go Fiber)..."
	LogServerListening    = "Servidor Go Fiber escuchando en el puerto %s\n"
	LogServerStopped      = "El servidor Fiber finalizó su ejecución: %v\n"
	LogShutdownSignal     = "Señal de apagado recibida. Ejecutando Graceful Shutdown..."
	LogShutdownError      = "Error durante el apagado del servidor Go: %v\n"
	LogShutdownSuccess    = "Microservicio Go finalizado limpiamente."
)
