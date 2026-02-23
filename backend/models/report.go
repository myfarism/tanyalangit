package models

import "time"

type Report struct {
    ID        string    `db:"id" json:"id"`
    Condition string    `db:"condition" json:"condition"`
    Lat       float64   `db:"lat" json:"lat"`
    Lng       float64   `db:"lng" json:"lng"`
    IsOnsite  bool      `db:"is_onsite" json:"is_onsite"`
    CreatedAt time.Time `db:"created_at" json:"created_at"`
    ExpiresAt time.Time `db:"expires_at" json:"expires_at"`
}

type CreateReportRequest struct {
    Condition string  `json:"condition"`
    Lat       float64 `json:"lat"`
    Lng       float64 `json:"lng"`
    IsOnsite  bool    `json:"is_onsite"`
}
