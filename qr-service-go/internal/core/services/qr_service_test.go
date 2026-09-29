package services

import (
	"context"
	"math"
	"math/rand"
	"testing"

	"qr-service-go/internal/core/domain"
)

/*
 * ============================================================================
 * PRUEBAS UNITARIAS Y BENCHMARKS: Verificación Matemática y Rendimiento Concurrente
 * ============================================================================
 * 
 * En computación científica e ingeniería numérica, las pruebas unitarias no solo verifican
 * que la función no lance pánicos, sino que validan las tres PROPIEDADES FUNDAMENTALES de la Descomposición QR:
 * 1. Reconstrucción exacta: Q * R debe ser igual a la matriz original A (A = QR).
 * 2. Ortonormalidad de Q: Q^T * Q = I (Matriz Identidad).
 * 3. Forma Triangular de R: R_ij = 0 para i > j.
 * 
 * Además, incluimos benchmarks (go test -bench=.) para medir empíricamente la aceleración (Speedup)
 * que nos otorgan las Goroutines frente a la ejecución monocore secuencial.
 * ============================================================================
 */

// helperToGenerateRandomMatrix crea una matriz m x n con valores flotantes aleatorios.
func generateRandomMatrix(rows, cols int) domain.Matrix {
	r := rand.New(rand.NewSource(42)) // Semilla fija para reproducibilidad matemática
	m := domain.NewMatrix(rows, cols)
	for i := 0; i < rows; i++ {
		for j := 0; j < cols; j++ {
			m[i][j] = r.Float64() * 100.0
		}
	}
	return m
}

// TestQRDecompositionCorrectness verifica las tres propiedades axiomáticas del álgebra lineal.
func TestQRDecompositionCorrectness(t *testing.T) {
	svc := NewQRService()
	ctx := context.Background()

	// Matriz de prueba conocida 3x3
	input := domain.Matrix{
		{12, -51, 4},
		{6, 167, -68},
		{-4, 24, -41},
	}

	result, err := svc.Decompose(ctx, input)
	if err != nil {
		t.Fatalf("Error inesperado en la descomposición: %v", err)
	}

	m := len(input)
	n := len(input[0])

	// 1. Validar forma triangular superior de R
	for i := 0; i < n; i++ {
		for j := 0; j < i; j++ {
			if math.Abs(result.R[i][j]) > 1e-9 {
				t.Errorf("R no es triangular superior en [%d][%d]: %f", i, j, result.R[i][j])
			}
		}
	}

	// 2. Validar ortonormalidad Q^T * Q = I
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			var dot float64
			for k := 0; k < m; k++ {
				dot += result.Q[k][i] * result.Q[k][j]
			}
			expected := 0.0
			if i == j {
				expected = 1.0
			}
			if math.Abs(dot-expected) > 1e-6 {
				t.Errorf("Falla de ortonormalidad Q^T*Q en [%d][%d]: esperado %f, obtenido %f", i, j, expected, dot)
			}
		}
	}

	// 3. Validar reconstrucción Q * R = A
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			var val float64
			for k := 0; k < n; k++ {
				val += result.Q[i][k] * result.R[k][j]
			}
			if math.Abs(val-input[i][j]) > 1e-6 {
				t.Errorf("Falla en la reconstrucción Q*R = A en [%d][%d]: esperado %f, obtenido %f", i, j, input[i][j], val)
			}
		}
	}
}

// BenchmarkQRDecomposeSequential mide el tiempo de respuesta en un solo hilo para una matriz 300x300.
func BenchmarkQRDecomposeSequential(b *testing.B) {
	svc := NewQRService()
	ctx := context.Background()
	matrix := generateRandomMatrix(300, 300)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = svc.DecomposeSequential(ctx, matrix)
	}
}

// BenchmarkQRDecomposeConcurrent mide el tiempo de respuesta usando Goroutines para la misma matriz 300x300.
func BenchmarkQRDecomposeConcurrent(b *testing.B) {
	svc := NewQRService()
	ctx := context.Background()
	matrix := generateRandomMatrix(300, 300)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = svc.Decompose(ctx, matrix)
	}
}
