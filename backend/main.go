package main

import (
	"log"

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
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	routes.Setup(app)

	log.Fatal(app.Listen(":8080"))
}
