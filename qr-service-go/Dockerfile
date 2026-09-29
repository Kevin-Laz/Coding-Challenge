# Stage 1: Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copiar archivos de definición de módulos para cachear dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente completo
COPY . .

# Compilar binario estático sin CGO para máxima velocidad y seguridad en Docker
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /qr-service ./cmd/api/main.go

# Stage 2: Runtime minimalista
FROM alpine:latest

WORKDIR /app

# Instalar ca-certificates por si se requieren llamadas HTTPS
RUN apk --no-cache add ca-certificates

# Copiar binario compilado desde el builder stage
COPY --from=builder /qr-service .

EXPOSE 8080

CMD ["./qr-service"]
