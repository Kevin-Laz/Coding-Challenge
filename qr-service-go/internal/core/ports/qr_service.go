package ports

import (
	"context"
	"qr-service-go/internal/core/domain"
)

/*
 * ============================================================================
 * PUERTO DE ENTRADA (Inbound Port): Contrato de Descomposición QR
 * ============================================================================
 * 
 * La Arquitectura Hexagonal dicta que el núcleo de la aplicación nunca debe depender 
 * directamente de los adaptadores de infraestructura o transporte (como Fiber, Gin o gRPC).
 * 
 * Al establecer el contrato `QRDecomposer`, garantizamos:
 * 1. Inversión de Dependencias (Principio 'D' de SOLID): El adaptador HTTP depende de esta interfaz,
 *    no de una implementación concreta del algoritmo numérico.
 * 2. Intercambiabilidad de Algoritmos: Podemos alternar entre Gram-Schmidt Modificado secuencial,
 *    Gram-Schmidt concurrente o Reflexiones de Householder sin modificar una sola línea del controlador HTTP.
 * 3. Testabilidad Avanzada: Facilita el uso de Mocks durante las pruebas unitarias de los adaptadores.
 * ============================================================================
 */

// QRDecomposer especifica el contrato de uso para la factorización matricial QR.
type QRDecomposer interface {
	// Decompose efectúa la factorización A = Q * R utilizando concurrencia óptima mediante Worker Pool o Goroutines.
	Decompose(ctx context.Context, input domain.Matrix) (*domain.ResultQR, error)

	// DecomposeSequential ejecuta la factorización de forma estrictamente secuencial.
	// Se expone intencionalmente para la realización de pruebas comparativas (benchmarks) de velocidad y aceleración (speedup).
	DecomposeSequential(ctx context.Context, input domain.Matrix) (*domain.ResultQR, error)
}
