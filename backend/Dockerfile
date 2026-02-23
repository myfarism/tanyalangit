FROM golang:1.25-alpine

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o tanyalangit-backend .

EXPOSE 8080

CMD ["./tanyalangit-backend"]
