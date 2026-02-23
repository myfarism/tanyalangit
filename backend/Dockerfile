# Stage 1 — Build
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install dependencies dulu biar layer cache optimal
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o tanyalangit-backend .

# Stage 2 — Runtime (minimal image)
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates buat HTTPS calls + timezone data
RUN apk --no-cache add ca-certificates tzdata

# Copy binary dari builder
COPY --from=builder /app/tanyalangit-backend .

# Port yang diexpose
EXPOSE 8080

# Jalankan binary
CMD ["./tanyalangit-backend"]
