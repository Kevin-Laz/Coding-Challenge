package constants

// Domain validation and restriction error messages.
const (
	ErrEmptyMatrixMsg       = "la matriz no puede estar vacía ni contener filas vacías"
	ErrInvalidDimensionsMsg = "la matriz debe tener dimensiones válidas"
	ErrNonRectangularMsg    = "todas las filas de la matriz deben poseer la misma cantidad de columnas"
	ErrInsufficientRowsMsg  = "para la descomposición QR, el número de filas (m) debe ser mayor o igual al número de columnas (n)"
)
