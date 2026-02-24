package routes

import (
	"os"

	"github.com/myfarism/tanyalangit/config"
	"github.com/myfarism/tanyalangit/handlers"
	"github.com/myfarism/tanyalangit/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func Setup(app *fiber.App) {
	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		status := fiber.Map{
			"status": "ok",
			"db":     config.IsConnected(),
		}
		return c.JSON(status)
	})

	// Debug endpoint untuk cek env vars (tanpa expose password)
	app.Get("/debug/env", func(c *fiber.Ctx) error {
		hasDbUrl := os.Getenv("DATABASE_URL") != ""
		dbUrlLen := 0
		if hasDbUrl {
			dbUrlLen = len(os.Getenv("DATABASE_URL"))
		}

		return c.JSON(fiber.Map{
			"DATABASE_URL_exists": hasDbUrl,
			"DATABASE_URL_length": dbUrlLen,
			"PORT":                os.Getenv("PORT"),
			"DB_connected":        config.IsConnected(),
		})
	})

	api := app.Group("/api")
	api.Post("/reports", middleware.RateLimit(), handlers.CreateReport)
	api.Get("/reports/nearby", handlers.GetNearbyReports)

	// Requests
	api.Post("/requests", middleware.RateLimit(), handlers.CreateLocationRequest)
	api.Get("/requests/nearby", handlers.GetNearbyRequests)
	api.Get("/requests/:id", handlers.GetRequestByID)

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws", websocket.New(handlers.WebSocketHandler))
}
