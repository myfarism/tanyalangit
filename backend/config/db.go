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

		// Debug: Print first 20 chars to identify format
		preview := rawDSN
		if len(preview) > 50 {
			preview = preview[:50] + "..."
		}
		log.Printf("[DB] URL preview: %s", preview)

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

			// Run migrations
			if err := runMigrations(); err != nil {
				log.Printf("[DB] Migration warning: %v", err)
			} else {
				log.Println("[DB] ✓ Migrations completed")
			}

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
		return "", fmt.Errorf("parse error: %w", err)
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

	// Debug logging
	log.Printf("[DB] Parsed - host: %s, port: %s, user: %s, dbname: %s",
		host, port, user, dbname)

	// Validate required fields
	if host == "" || user == "" || dbname == "" {
		return "", fmt.Errorf("missing required fields: host=%s user=%s dbname=%s", host, user, dbname)
	}

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
func runMigrations() error {
	migrations := `
    -- Enable PostGIS extension
    CREATE EXTENSION IF NOT EXISTS postgis;

    -- Reports table
    CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        condition VARCHAR(50) NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        is_onsite BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '2 hours'
    );

    -- Location requests table
    CREATE TABLE IF NOT EXISTS location_requests (
        id SERIAL PRIMARY KEY,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        location GEOGRAPHY(POINT, 4326) NOT NULL,
        area_name VARCHAR(100) NOT NULL,
        message TEXT,
        fulfilled_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
    );

    -- Create spatial indexes for performance
    CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST(location);
    CREATE INDEX IF NOT EXISTS idx_reports_expires ON reports(expires_at);
    CREATE INDEX IF NOT EXISTS idx_requests_location ON location_requests USING GIST(location);
    CREATE INDEX IF NOT EXISTS idx_requests_expires ON location_requests(expires_at);
    `

	_, err := DB.Exec(migrations)
	return err
}
