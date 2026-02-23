package config

import (
    "fmt"
    "log"
    "os"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB() {
    dsn := os.Getenv("DATABASE_URL")
    
    // Fallback ke individual vars kalau lokal
    if dsn == "" {
        dsn = fmt.Sprintf(
            "host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
            os.Getenv("DB_HOST"),
            os.Getenv("DB_PORT"),
            os.Getenv("DB_USER"),
            os.Getenv("DB_PASSWORD"),
            os.Getenv("DB_NAME"),
        )
    }

    db, err := sqlx.Connect("postgres", dsn)
    if err != nil {
        log.Fatalf("[DB] Failed to connect: %v", err)
    }

    DB = db
    log.Println("[DB] Connected")
}

