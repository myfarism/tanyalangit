package config

import (
    "fmt"
    "log"
    "os"
    "time"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB() {
    dsn := os.Getenv("DATABASE_URL")
    
    // Fallback ke individual vars kalau lokal
    if dsn == "" {
        log.Println("[DB] DATABASE_URL not found, trying individual vars")
        dsn = fmt.Sprintf(
            "host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
            os.Getenv("DB_HOST"),
            os.Getenv("DB_PORT"),
            os.Getenv("DB_USER"),
            os.Getenv("DB_PASSWORD"),
            os.Getenv("DB_NAME"),
        )
    } else {
        log.Printf("[DB] Using DATABASE_URL (length: %d chars)", len(dsn))
    }

    // Retry logic untuk Railway
    maxRetries := 10
    for i := 0; i < maxRetries; i++ {
        db, err := sqlx.Connect("postgres", dsn)
        if err == nil {
            DB = db
            // Test connection
            if pingErr := db.Ping(); pingErr != nil {
                log.Printf("[DB] Connected but ping failed: %v", pingErr)
                db.Close()
                DB = nil
                if i < maxRetries-1 {
                    time.Sleep(2 * time.Second)
                }
                continue
            }
            log.Println("[DB] ✓ Connected successfully")
            return
        }

        log.Printf("[DB] Connection attempt %d/%d failed: %v", i+1, maxRetries, err)
        if i < maxRetries-1 {
            time.Sleep(2 * time.Second)
        }
    }

    log.Println("[DB] ⚠ WARNING: Failed to connect after retries, continuing without DB")
}

func IsConnected() bool {
    return DB != nil && DB.Ping() == nil
}

