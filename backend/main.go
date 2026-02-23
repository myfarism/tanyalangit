package main

import (
	"log"
	"os"

	"github.com/myfarism/tanyalangit/config"
	"github.com/myfarism/tanyalangit/jobs"
	"github.com/myfarism/tanyalangit/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
    godotenv.Load()
    config.InitDB()
    jobs.StartCleanupJob()

    app := fiber.New()
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept",
        AllowMethods: "GET,POST,OPTIONS",
    }))

    routes.Setup(app)

    // Railway inject $PORT, fallback ke 8080 buat lokal
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Fatal(app.Listen("0.0.0.0:" + port))
}

