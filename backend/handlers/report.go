package handlers

import (
	"github.com/myfarism/tanyalangit/config"
	"github.com/myfarism/tanyalangit/hub"
	"github.com/myfarism/tanyalangit/models"

	"github.com/gofiber/fiber/v2"
)

func CreateReport(c *fiber.Ctx) error {
	if !config.IsConnected() {
		return c.Status(503).JSON(fiber.Map{"error": "Database not available"})
	}

	var req models.CreateReportRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
	}

	// Validasi condition
	validConditions := map[string]bool{
		"sunny": true, "cloudy": true,
		"drizzle": true, "heavy_rain": true, "flood": true,
	}
	if !validConditions[req.Condition] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid condition"})
	}

	// Validasi lat/lng — batas Indonesia + sedikit margin
	if req.Lat < -11.5 || req.Lat > 6.5 || req.Lng < 94.5 || req.Lng > 141.5 {
		return c.Status(400).JSON(fiber.Map{"error": "Lokasi di luar jangkauan"})
	}

	// Validasi NaN / Infinity
	if req.Lat == 0 && req.Lng == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Koordinat tidak valid"})
	}

	var report models.Report
	err := config.DB.QueryRowx(`
		INSERT INTO reports (condition, lat, lng, location, is_onsite)
		VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4)
		RETURNING id, condition, lat, lng, is_onsite, created_at, expires_at
	`, req.Condition, req.Lat, req.Lng, req.IsOnsite).StructScan(&report)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	hub.H.BroadcastNearby(req.Lat, req.Lng, report)
	return c.Status(201).JSON(report)
}

func GetNearbyReports(c *fiber.Ctx) error {
	if !config.IsConnected() {
		return c.Status(503).JSON(fiber.Map{"error": "Database not available"})
	}

	lat := c.QueryFloat("lat", 0)
	lng := c.QueryFloat("lng", 0)
	radius := c.QueryFloat("radius", 5)
	limit := c.QueryInt("limit", 100)

	// Clamp biar gak bisa minta kebanyakan
	if radius > 20 {
		radius = 20
	}
	if limit > 200 {
		limit = 200
	}

	reports := []models.Report{}
	err := config.DB.Select(&reports, `
		SELECT id, condition, lat, lng, is_onsite, created_at, expires_at
		FROM reports
		WHERE expires_at > NOW()
		  AND ST_DWithin(
		      location,
		      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
		      $3 * 1000
		  )
		ORDER BY created_at DESC
		LIMIT $4
	`, lat, lng, radius, limit)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(reports)
}
