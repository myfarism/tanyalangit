package config

import (
    "fmt"
    "log"
    "net/url"
    "os"
    "strings"
    "time"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB() {
    rawDSN := os.Getenv("DATABASE_URL")
    var dsn string
    
    // Fallback ke individual vars kalau lokal
    if rawDSN == "" {
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
        log.Printf("[DB] Using DATABASE_URL (length: %d chars)", len(rawDSN))
        
        // Parse Railway's postgres:// or postgresql:// URL ke format lib/pq
        parsedDSN, err := parsePostgresURL(rawDSN)
        if err != nil {
            log.Printf("[DB] Failed to parse DATABASE_URL: %v, using raw", err)
            dsn = rawDSN
        } else {
            dsn = parsedDSN
            log.Println("[DB] Successfully parsed DATABASE_URL")
        }
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

// parsePostgresURL converts postgres://user:pass@host:port/dbname to lib/pq format
func parsePostgresURL(rawURL string) (string, error) {
    // Replace postgresql:// with postgres:// for consistency
    rawURL = strings.Replace(rawURL, "postgresql://", "postgres://", 1)
    
    u, err := url.Parse(rawURL)
    if err != nil {
        return "", err
    }

    // Extract components
    host := u.Hostname()
    port := u.Port()
    if port == "" {
        port = "5432"
    }
    
    user := u.User.Username()
    password, _ := u.User.Password()
    dbname := strings.TrimPrefix(u.Path, "/")
    
    // Build lib/pq connection string
    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
        host, port, user, password, dbname,
    )
    
    return dsn, nil
}

func IsConnected() bool {
    return DB != nil && DB.Ping() == nil
}

