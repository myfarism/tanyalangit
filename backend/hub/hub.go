package hub

import (
    "encoding/json"
    "sync"

    "github.com/gofiber/websocket/v2"
)

type Client struct {
    Conn *websocket.Conn
    Lat  float64
    Lng  float64
}

type Hub struct {
    clients map[*Client]bool
    mu      sync.RWMutex
}

var H = &Hub{
    clients: make(map[*Client]bool),
}

func (h *Hub) Register(c *Client) {
    h.mu.Lock()
    defer h.mu.Unlock()
    h.clients[c] = true
}

func (h *Hub) Unregister(c *Client) {
    h.mu.Lock()
    defer h.mu.Unlock()
    delete(h.clients, c)
}

// Broadcast ke semua client yang dalam radius 10km
func (h *Hub) BroadcastNearby(lat, lng float64, payload any) {
    h.mu.RLock()
    defer h.mu.RUnlock()

    data, _ := json.Marshal(payload)

    for client := range h.clients {
        if isNearby(client.Lat, client.Lng, lat, lng, 10.0) {
            client.Conn.WriteMessage(1, data)
        }
    }
}

// Haversine formula sederhana, radius dalam km
func isNearby(lat1, lng1, lat2, lng2, radiusKm float64) bool {
    const earthRadius = 6371.0
    dLat := (lat2 - lat1) * (3.14159265 / 180)
    dLng := (lng2 - lng1) * (3.14159265 / 180)
    a := dLat*dLat + dLng*dLng
    return (earthRadius * a) < (radiusKm * radiusKm)
}
