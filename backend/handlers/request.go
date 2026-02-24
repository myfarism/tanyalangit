package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/myfarism/tanyalangit/config"
	"github.com/myfarism/tanyalangit/models"
)

func CreateLocationRequest(c *fiber.Ctx) error {
	if !config.IsConnected() {
		return c.Status(503).JSON(fiber.Map{"error": "Database not available"})
	}

	var req models.CreateRequestPayload
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	// Validasi koordinat Indonesia
	if req.Lat < -11.5 || req.Lat > 6.5 || req.Lng < 94.5 || req.Lng > 141.5 {
		return c.Status(400).JSON(fiber.Map{"error": "Lokasi di luar jangkauan"})
	}

	// Truncate message
	if len(req.Message) > 200 {
		req.Message = req.Message[:200]
	}
	if len(req.AreaName) > 100 {
		req.AreaName = req.AreaName[:100]
	}

	var result models.LocationRequest
	err := config.DB.QueryRowx(`
		INSERT INTO location_requests (lat, lng, location, area_name, message)
		VALUES ($1, $2, ST_SetSRID(ST_MakePoint($2, $1), 4326), $3, $4)
		RETURNING id, lat, lng, area_name, message, fulfilled_count, created_at, expires_at
	`, req.Lat, req.Lng, req.AreaName, req.Message).StructScan(&result)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(result)
}

func GetNearbyRequests(c *fiber.Ctx) error {
	if !config.IsConnected() {
		return c.Status(503).JSON(fiber.Map{"error": "Database not available"})
	}

	lat := c.QueryFloat("lat", 0)
	lng := c.QueryFloat("lng", 0)
	radius := c.QueryFloat("radius", 10)

	if radius > 30 {
		radius = 30
	}

	requests := []models.LocationRequest{}
	err := config.DB.Select(&requests, `
		SELECT id, lat, lng, area_name, message, fulfilled_count, created_at, expires_at
		FROM location_requests
		WHERE expires_at > NOW()
		  AND ST_DWithin(
		      location,
		      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
		      $3 * 1000
		  )
		ORDER BY created_at DESC
	`, lat, lng, radius)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(requests)
}

func GetRequestByID(c *fiber.Ctx) error {
	if !config.IsConnected() {
		return c.Status(503).JSON(fiber.Map{"error": "Database not available"})
	}

	id := c.Params("id")

	var req models.LocationRequest
	err := config.DB.QueryRowx(`
		SELECT id, lat, lng, area_name, message, fulfilled_count, created_at, expires_at
		FROM location_requests
		WHERE id = $1 AND expires_at > NOW()
	`, id).StructScan(&req)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Request tidak ditemukan atau sudah expired"})
	}

	return c.JSON(req)
}

// Dipanggil saat ada yang fulfill request
func IncrementFulfilled(requestID string) {
	config.DB.Exec(`
		UPDATE location_requests
		SET fulfilled_count = fulfilled_count + 1
		WHERE id = $1
	`, requestID)
}
