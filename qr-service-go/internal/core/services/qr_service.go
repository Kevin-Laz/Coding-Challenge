package services

import (
	"context"
	"math"
	"runtime"
	"sync"
	"time"

	"qr-service-go/internal/core/domain"
	"qr-service-go/internal/core/ports"
)

/*
 * ============================================================================
 * SERVICIO DE DOMINIO: Algoritmo Gram-Schmidt Modificado (MGS) Concurrente
 * ============================================================================
 * 
 * 1. ¿Por qué Gram-Schmidt MODIFICADO (MGS) y no Gram-Schmidt Clásico (CGS)?
 *    CGS sufre de inestabilidad numérica severa debido a la acumulación de errores de redondeo
 *    en aritmética de punto flotante de precisión doble (IEEE 754 float64). Las columnas resultantes
 *    en CGS pierden ortogonalidad rápidamente cuando m y n crecen. MGS ortogonaliza cada vector
 *    contra los vectores que ya han sido actualizados, manteniendo la ortogonalidad numérica mucho más estable.
 * 
 * 2. ¿Cómo logramos Concurrencia sin Race Conditions (Data Races)?
 *    En el bucle externo de la etapa k (donde k es la columna pivote actual):
 *    - La columna pivote k ya ha sido normalizada para obtener el vector base Q_k.
 *    - Las proyecciones y sustracciones en las columnas j posteriores (donde j > k) son MATEMÁTICAMENTE INDEPENDIENTES.
 *    - Cada Goroutine trabaja de forma exclusiva sobre un subconjunto de columnas j asignadas.
 *    - Ninguna goroutine escribe en la misma posición de memoria que otra, ya que la columna j es la clave de indexación.
 *    - Sincronizamos las goroutines en cada paso k usando `sync.WaitGroup` antes de avanzar al paso k+1.
 * ============================================================================
 */

type qrService struct {
	// minColsForParallelism define el umbral mínimo de columnas restantes para activar el pool de goroutines.
	// Nota para el futuro: Si n es muy pequeño (ej. matriz 3x3), el costo de crear goroutines y context-switch
	// supera el tiempo del cálculo secuencial (Overhead). Por eso usamos un umbral dinámico.
	minColsForParallelism int
}

// NewQRService construye una instancia del servicio de descomposición QR inyectando configuraciones de rendimiento.
func NewQRService() ports.QRDecomposer {
	return &qrService{
		minColsForParallelism: 8,
	}
}

// Decompose es la implementación concurrente del puerto de entrada QRDecomposer.
func (s *qrService) Decompose(ctx context.Context, input domain.Matrix) (*domain.ResultQR, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}

	startTime := time.Now()
	m := len(input)
	n := len(input[0])

	// Copiamos la matriz de entrada a una matriz de trabajo V para no mutar el slice original (Inmutabilidad).
	V := domain.NewMatrix(m, n)
	for i := 0; i < m; i++ {
		copy(V[i], input[i])
	}

	Q := domain.NewMatrix(m, n)
	R := domain.NewMatrix(n, n)

	numWorkers := runtime.NumCPU()

	// Proceso Gram-Schmidt Modificado (MGS) con paralelización por columnas
	for k := 0; k < n; k++ {
		// 1. Calcular la norma 2 de la columna k actual en la matriz V
		var norm float64
		for i := 0; i < m; i++ {
			norm += V[i][k] * V[i][k]
		}
		norm = math.Sqrt(norm)
		R[k][k] = norm

		// Prevenir división por cero si la columna es linealmente dependiente o prácticamente nula
		const eps = 1e-15
		if norm > eps {
			for i := 0; i < m; i++ {
				Q[i][k] = V[i][k] / norm
			}
		} else {
			for i := 0; i < m; i++ {
				Q[i][k] = 0.0
			}
		}

		remainingCols := n - (k + 1)
		if remainingCols <= 0 {
			continue
		}

		// Si el número de columnas restantes es pequeño, ejecutamos secuencialmente para no pagar overhead
		if remainingCols < s.minColsForParallelism {
			for j := k + 1; j < n; j++ {
				var dot float64
				for i := 0; i < m; i++ {
					dot += Q[i][k] * V[i][j]
				}
				R[k][j] = dot

				for i := 0; i < m; i++ {
					V[i][j] -= dot * Q[i][k]
				}
			}
			continue
		}

		// 2. Paralelización concurrente usando Goroutines y sync.WaitGroup
		// Dividimos las columnas j restantes (k+1 hasta n-1) entre los workers disponibles.
		var wg sync.WaitGroup
		colsPerWorker := (remainingCols + numWorkers - 1) / numWorkers

		for w := 0; w < numWorkers; w++ {
			startJ := (k + 1) + w*colsPerWorker
			endJ := startJ + colsPerWorker
			if endJ > n {
				endJ = n
			}

			if startJ >= endJ {
				break
			}

			wg.Add(1)
			go func(start, end int) {
				defer wg.Done()

				// Cada Worker procesa de forma totalmente independiente sus columnas asignadas [start, end)
				for j := start; j < end; j++ {
					var dot float64
					for i := 0; i < m; i++ {
						dot += Q[i][k] * V[i][j]
					}
					R[k][j] = dot

					// Ortogonalización: V_j = V_j - (R_kj * Q_k)
					for i := 0; i < m; i++ {
						V[i][j] -= dot * Q[i][k]
					}
				}
			}(startJ, endJ)
		}

		// Bloqueamos la ejecución del paso k hasta que todas las columnas j hayan sido proyectadas
		wg.Wait()
	}

	elapsedMs := float64(time.Since(startTime).Microseconds()) / 1000.0

	return &domain.ResultQR{
		Q:               Q,
		R:               R,
		ExecutionTimeMs: elapsedMs,
	}, nil
}

// DecomposeSequential ejecuta el mismo algoritmo MGS pero estrictamente monocore (sin Goroutines).
// Explicación para el futuro: Mantener la versión secuencial pura en el mismo paquete nos permite
// correr 'go test -bench=.' para verificar cuantitativamente el Speedup y Eficiencia paralela.
func (s *qrService) DecomposeSequential(ctx context.Context, input domain.Matrix) (*domain.ResultQR, error) {
	if err := input.Validate(); err != nil {
		return nil, err
	}

	startTime := time.Now()
	m := len(input)
	n := len(input[0])

	V := domain.NewMatrix(m, n)
	for i := 0; i < m; i++ {
		copy(V[i], input[i])
	}

	Q := domain.NewMatrix(m, n)
	R := domain.NewMatrix(n, n)

	for k := 0; k < n; k++ {
		var norm float64
		for i := 0; i < m; i++ {
			norm += V[i][k] * V[i][k]
		}
		norm = math.Sqrt(norm)
		R[k][k] = norm

		const eps = 1e-15
		if norm > eps {
			for i := 0; i < m; i++ {
				Q[i][k] = V[i][k] / norm
			}
		} else {
			for i := 0; i < m; i++ {
				Q[i][k] = 0.0
			}
		}

		for j := k + 1; j < n; j++ {
			var dot float64
			for i := 0; i < m; i++ {
				dot += Q[i][k] * V[i][j]
			}
			R[k][j] = dot

			for i := 0; i < m; i++ {
				V[i][j] -= dot * Q[i][k]
			}
		}
	}

	elapsedMs := float64(time.Since(startTime).Microseconds()) / 1000.0

	return &domain.ResultQR{
		Q:               Q,
		R:               R,
		ExecutionTimeMs: elapsedMs,
	}, nil
}
