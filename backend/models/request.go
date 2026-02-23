package models

import "time"

type LocationRequest struct {
	ID             string    `db:"id" json:"id"`
	Lat            float64   `db:"lat" json:"lat"`
	Lng            float64   `db:"lng" json:"lng"`
	AreaName       string    `db:"area_name" json:"area_name"`
	Message        string    `db:"message" json:"message"`
	FulfilledCount int       `db:"fulfilled_count" json:"fulfilled_count"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	ExpiresAt      time.Time `db:"expires_at" json:"expires_at"`
}

type CreateRequestPayload struct {
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
	AreaName string  `json:"area_name"`
	Message  string  `json:"message"`
}
