# =========================
# Build Stage
# =========================
FROM golang:1.25-alpine AS builder

# Install git (dibutuhkan jika ada private module)
RUN apk add --no-cache git

WORKDIR /app

# Copy go mod dulu (biar caching optimal)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o app

# =========================
# Final Stage
# =========================
FROM alpine:latest

# Install CA certificates (untuk HTTPS request keluar)
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary dari builder
COPY --from=builder /app/app .

# Security: jalankan sebagai non-root user
RUN adduser -D appuser
USER appuser

# Railway inject PORT otomatis
EXPOSE 8080

CMD ["./app"]