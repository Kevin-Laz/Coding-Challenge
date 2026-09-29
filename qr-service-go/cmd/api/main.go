package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"

	adaptersHTTP "qr-service-go/internal/adapters/http"
	"qr-service-go/internal/core/services"
)

/*
 * ============================================================================
 * PUNTO DE ENTRADA Y COMPOSICIÓN (Composition Root)
 * ============================================================================
 * 
 * En la Arquitectura Hexagonal, la capa de inicialización `main.go` es la ÚNICA
 * responsable de conocer las implementaciones concretas e interconectarlas.
 * 
 * Flujo de Inyección de Dependencias:
 *   [Servicio Dominio: services.NewQRService()] 
 *         ↓ (satisface la interfaz ports.QRDecomposer)
 *   [Adaptador HTTP: adaptersHTTP.NewQRHandler(...)]
 *         ↓
 *   [Configuración de Rutas Fiber: adaptersHTTP.SetupRoutes(...)]
 * 
 * Además, implementamos Graceful Shutdown escuchando las señales del Kernel (SIGINT, SIGTERM)
 * para garantizar que las peticiones HTTP en vuelo se completen antes de destruir el proceso en Docker.
 * ============================================================================
 */

func main() {
	log.Println("Inicializando Motor Concurrente de Descomposición QR (Go Fiber)...")

	// 1. Instanciación del Core de Dominio
	qrService := services.NewQRService()

	// 2. Instanciación del Adaptador Primario HTTP inyectando la interfaz del puerto
	qrHandler := adaptersHTTP.NewQRHandler(qrService)

	// 3. Creación de la app Fiber con configuraciones optimizadas
	app := fiber.New(fiber.Config{
		AppName:               "Go Fiber QR Engine",
		DisableStartupMessage: false,
	})

	// 4. Registro de Middlewares y Rutas
	adaptersHTTP.SetupRoutes(app, qrHandler)

	// 5. Lectura de puerto de entorno
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 6. Inicio asíncrono e implementación de Graceful Shutdown
	go func() {
		if err := app.Listen(":" + port); err != nil {
			log.Printf("El servidor Fiber finalizó su ejecución: %v\n", err)
		}
	}()

	log.Printf("Servidor Go Fiber escuchando en el puerto %s\n", port)

	// Canal para escuchar señales de apagado del SO
	stopSig := make(chan os.Signal, 1)
	signal.Notify(stopSig, os.Interrupt, syscall.SIGTERM)

	// Bloqueo hasta recibir la señal SIGINT / SIGTERM
	<-stopSig

	log.Println("Señal de apagado recibida. Ejecutando Graceful Shutdown...")
	if err := app.Shutdown(); err != nil {
		log.Fatalf("Error durante el apagado del servidor Go: %v\n", err)
	}

	log.Println("Microservicio Go finalizado limpiamente.")
}
