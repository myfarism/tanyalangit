package handlers

import (
	"strconv"

	"github.com/myfarism/tanyalangit/hub"

	"github.com/gofiber/websocket/v2"
)

func WebSocketHandler(c *websocket.Conn) {
	lat, _ := strconv.ParseFloat(c.Query("lat"), 64)
	lng, _ := strconv.ParseFloat(c.Query("lng"), 64)

	client := &hub.Client{Conn: c, Lat: lat, Lng: lng}
	hub.H.Register(client)
	defer hub.H.Unregister(client)

	// Keep connection alive, tunggu client disconnect
	for {
		if _, _, err := c.ReadMessage(); err != nil {
			break
		}
	}
}
