package domain

import (
	"errors"
	"fmt"

	"qr-service-go/internal/constants"
)

/*
 * ============================================================================
 * DOMINIO: Entidades y Modelos de Dominio para Álgebra Lineal
 * ============================================================================
 * 
 * El núcleo del dominio debe ser agnóstico a cualquier
 * tecnología o framework (Fiber, Express, bases de datos). Al definir Matrix como un
 * tipo explícito sobre [][]float64, podemos encapsular métodos de validación matemática
 * y mantener la regla de inmutabilidad estructural antes de ejecutar operaciones pesadas.
 * 
 * Además, las validaciones de dimensiones previenen pánicos por 'index out of range'
 * dentro de las goroutines de concurrencia que procesan las columnas.
 * ============================================================================
 */

// Errores de dominio explícitos. Se usan tipos de error exportados para permitir
// la inspección de errores mediante errors.Is en los adaptadores primarios (handlers HTTP).
var (
	ErrEmptyMatrix       = errors.New(constants.ErrEmptyMatrixMsg)
	ErrInvalidDimensions = errors.New(constants.ErrInvalidDimensionsMsg)
	ErrNonRectangular    = errors.New(constants.ErrNonRectangularMsg)
	ErrInsufficientRows  = errors.New(constants.ErrInsufficientRowsMsg)
)

// Matrix representa una estructura matricial bidimensional fuertemente tipada de números reales float64.
type Matrix [][]float64

// MatrixDimensions abstrae la métrica dimensional de la matriz.
type MatrixDimensions struct {
	Rows int `json:"rows"`
	Cols int `json:"cols"`
}

// ResultQR encapsula la factorización matricial A = Q * R.
// Q es una matriz de dimensiones m x n con columnas ortonormales.
// R es una matriz triangular superior de dimensiones n x n.
type ResultQR struct {
	Q               Matrix  `json:"q"`
	R               Matrix  `json:"r"`
	ExecutionTimeMs float64 `json:"execution_time_ms"`
}

// Validate verifica que la matriz cumpla las restricciones matemáticas mínimas.
// Explicación técnica: La ortogonalización de Gram-Schmidt requiere vectores de columna bien definidos
// y dimensiones rectangulares donde m >= n para garantizar la existencia de la descomposición.
func (m Matrix) Validate() error {
	rows := len(m)
	if rows == 0 {
		return ErrEmptyMatrix
	}

	cols := len(m[0])
	if cols == 0 {
		return ErrEmptyMatrix
	}

	for i := 1; i < rows; i++ {
		if len(m[i]) != cols {
			return fmt.Errorf("%w: la fila %d tiene %d columnas, se esperaban %d", ErrNonRectangular, i, len(m[i]), cols)
		}
	}

	if rows < cols {
		return fmt.Errorf("%w: la matriz posee m=%d filas y n=%d columnas", ErrInsufficientRows, rows, cols)
	}

	return nil
}

// Dimensions devuelve las dimensiones de filas y columnas.
func (m Matrix) Dimensions() MatrixDimensions {
	if len(m) == 0 {
		return MatrixDimensions{Rows: 0, Cols: 0}
	}
	return MatrixDimensions{Rows: len(m), Cols: len(m[0])}
}

// NewMatrix reserva memoria para una matriz de dimensiones especificadas de forma contigua.
// Asignar explícitamente los slices con make evita múltiples reasignaciones
// dinámicas de memoria en el Heap durante las iteraciones de la descomposicion.
func NewMatrix(rows, cols int) Matrix {
	m := make(Matrix, rows)
	for i := range m {
		m[i] = make([]float64, cols)
	}
	return m
}
