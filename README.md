# Sistema de Descomposición QR y Orquestación Matricial Hexagonal

Este proyecto implementa un sistema distribuido desacoplado en **Arquitectura Hexagonal (Puertos y Adaptadores)** compuesto por dos microservicios fuertemente tipados:

1. **`qr-service-go`**: Motor de descomposición QR en Go (Fiber) con paralelización por Goroutines y `sync.WaitGroup` sobre el algoritmo de Gram-Schmidt Modificado (MGS).
2. **`gateway-service-node`**: API Gateway en Node.js (Express + TypeScript) que valida peticiones, orquesta la llamada al motor de Go y calcula métricas estadísticas algebraicas avanzadas (Norma de Frobenius, media, error de residuo).

---

## 1. Flujo de Comunicación Secuencial

```
Cliente HTTP 
     │
     ▼ [POST /process]
[ API Express (Node.js / TypeScript) ] ── (Adaptador HTTP Primario)
     │
     ├── 1. Valida dimensiones m >= n y consistencia numérica (Domain Type Guards)
     │
     ▼ [HTTP Client Adapter] ── POST /qr/decompose
[ API Go (Fiber) ] ───────────────────── (Adaptador HTTP Primario)
     │
     ├── 2. Ejecución concurrente con Worker Pool / Goroutines (Gram-Schmidt Modificado)
     │
     ▼ [Retorna Matrices Q y R + Tiempo de Ejecución Go en JSON]
[ API Express ]
     │
     ├── 3. Calcula Estadísticas (Media, Norma de Frobenius, Error Residual ||A - Q*R||_F)
     │
     ▼ [Respuesta Final 200 OK]
Cliente HTTP
```

---

## 2. Estructura del Proyecto

```
backend/
├── qr-service-go/                 # Microservicio 1: Motor QR en Go
│   ├── cmd/
│   │   └── api/
│   │       └── main.go            # Composition Root e Inyección de Dependencias
│   ├── internal/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   │   └── matrix.go      # Tipos Matrix, ResultQR y validaciones de dominio
│   │   │   ├── ports/
│   │   │   │   └── qr_service.go  # Puerto de Entrada: QRDecomposer
│   │   │   └── services/
│   │   │       ├── qr_service.go  # Algoritmo MGS concurrente con Goroutines
│   │   │       └── qr_service_test.go # Pruebas de corrección y benchmarks
│   │   └── adapters/
│   │       └── http/
│   │           ├── handler.go     # Controlador Fiber (JSON DTOs, HTTP mapping)
│   │           └── router.go      # Middlewares y rutas Fiber
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── gateway-service-node/          # Microservicio 2: API Gateway en Express
│   ├── src/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   │   └── matrix.ts      # Interfaces TypeScript y Assertions de Dominio
│   │   │   ├── ports/
│   │   │   │   ├── qr_client.port.ts     # Puerto de Salida para HTTP Client
│   │   │   │   └── stats_service.port.ts  # Puerto de Dominio para Métricas
│   │   │   └── services/
│   │   │       └── process_matrix.ts     # Caso de Uso Orquestador + StatsService
│   │   ├── adapters/
│   │   │   ├── http/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── matrix.controller.ts # Controlador HTTP de Express
│   │   │   │   └── routes.ts                # Router Express
│   │   │   └── secondary/
│   │   │       └── qr_http_client.ts     # Adaptador HTTP secundario con fetch nativo
│   │   ├── app.ts                 # Configuración de Express y Middlewares
│   │   └── server.ts              # Composition Root e Inicio del Servidor
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
└── docker-compose.yml             # Orquestación de contenedores en la misma red
```

---

## 3. Pruebas Unitarias y Benchmarks en Go

Para verificar la corrección matemática y medir la aceleración (Speedup) obtenida con Goroutines:

```bash
cd qr-service-go

# Correr pruebas unitarias (reconstrucción A=QR, ortonormalidad Q^T*Q=I, R triangular)
go test -v ./internal/core/services/...

# Ejecutar Benchmarks comparando versión secuencial vs concurrente (300x300 matrix)
go test -bench='.' -benchmem ./internal/core/services
```

---

## 4. Despliegue con Docker Compose (Fase 5)

Para levantar ambos microservicios interconectados en la red interna:

```bash
# Desde la raíz de la carpeta backend/
docker-compose up --build
```

Endpoints expuestos:
- **API Gateway (Express)**: `http://localhost:3000/process`
- **Engine QR (Go)**: `http://localhost:8080/qr/decompose`

---

## 5. Ejemplo de Petición cURL

### Petición al Gateway (Express Node.js):
```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{
    "matrix": [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41]
    ]
  }'
```

### Respuesta de Ejemplo (JSON 200 OK):
```json
{
  "dimensions": {
    "rows": 3,
    "cols": 3
  },
  "originalStats": {
    "mean": 5.444444444444445,
    "frobeniusNorm": 194.270430070559,
    "min": -68,
    "max": 167,
    "sum": 49
  },
  "qrResult": {
    "q": [
      [-0.8571428571428571, 0.39428571428571423, -0.3314285714285714],
      [-0.42857142857142855, -0.9028571428571428, 0.03428571428571428],
      [0.2857142857142857, -0.17142857142857143, -0.9428571428571428]
    ],
    "r": [
      [-14, -21, 14],
      [0, -175, 70],
      [0, 0, -35]
    ],
    "qStats": {
      "mean": -0.3707936507936508,
      "frobeniusNorm": 1.7320508075688772,
      "min": -0.9428571428571428,
      "max": 0.39428571428571423,
      "sum": -3.337142857142857
    },
    "rStats": {
      "mean": -17.88888888888889,
      "frobeniusNorm": 194.270430070559,
      "min": -175,
      "max": 70,
      "sum": -161
    },
    "reconstructionErrorFrobenius": 1.4210854715202004e-14
  },
  "timing": {
    "goExecutionMs": 0.084,
    "totalOrchestrationMs": 4.12
  }
}
```
