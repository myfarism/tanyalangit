package jobs

import (
	"log"
	"time"

	"github.com/myfarism/tanyalangit/config"
)

func StartCleanupJob() {
	go func() {
		for range time.Tick(5 * time.Minute) {
			// Skip if DB not connected
			if !config.IsConnected() {
				log.Println("[cleanup] Skipping: DB not connected")
				continue
			}

			result, err := config.DB.Exec(`
				DELETE FROM reports WHERE expires_at < NOW()
			`)
			if err != nil {
				log.Printf("[cleanup] Error: %v", err)
				continue
			}

			rows, _ := result.RowsAffected()
			if rows > 0 {
				log.Printf("[cleanup] Deleted %d expired reports", rows)
			}

			// Cleanup expired requests
			r2, err := config.DB.Exec(`DELETE FROM location_requests WHERE expires_at < NOW()`)
			if err != nil {
				log.Printf("[cleanup] Requests error: %v", err)
			} else if rows, _ := r2.RowsAffected(); rows > 0 {
				log.Printf("[cleanup] Deleted %d expired requests", rows)
			}
		}
	}()
}
