Berikut versi README yang sudah diperbaiki: lebih ringkas, konsisten secara bahasa, rapi secara struktur, dan lebih “siap GitHub” (jelas value proposition-nya di awal, teknis tetap kuat, tapi tidak bertele-tele).

---

```md
# 🌧️ TanyaLangit

> Cuaca hyperlocal yang diisi manusia, bukan hanya satelit.

Saat hendak berangkat ke suatu tempat dan muncul pertanyaan:  
**“Di sana sekarang hujan deras atau tidak?”**  
TanyaLangit mencoba menjawabnya lewat laporan langsung dari orang yang benar-benar berada di lokasi tersebut.

![Demo](./docs/demo.gif)

---

## 🎯 Latar Belakang

Sebagian besar aplikasi cuaca menampilkan informasi seperti *“40% chance of rain”*.  
Secara statistik berguna — tetapi untuk keputusan praktis, sering kali kita hanya butuh jawaban sederhana:

> **Sekarang di sana hujan atau tidak?**

TanyaLangit adalah eksperimen crowdsourcing cuaca hyperlocal yang:

- Mengumpulkan laporan langsung dari pengguna di lokasi
- Mengelompokkan laporan untuk menghasilkan *confidence signal*
- Memungkinkan pengguna meminta info cuaca melalui tautan yang bisa dibagikan (misalnya ke grup WhatsApp)

---

## ✨ Fitur Utama

### 🔴 Laporan Cuaca Real-Time
- Klik peta → pilih kondisi: `cerah`, `mendung`, `gerimis`, `hujan lebat`, `banjir`
- Laporan aktif selama **30 menit**, lalu otomatis kedaluwarsa
- Update diterima secara realtime via WebSocket

---

### 🧠 Confidence Berbasis Jumlah Laporan
- Laporan dalam radius berdekatan dikelompokkan (*clustering*)
- Ikon membesar + badge jumlah laporan
- *On-site reporter* (pengguna yang mengonfirmasi berada di lokasi) diberi penanda khusus

Tujuannya bukan presisi ilmiah, tetapi **indikasi kepercayaan berbasis konsensus lokal**.

---

### ❓ “Minta Info” (Shareable Link)

Alur:

1. Klik peta → tab **Minta Info**
2. Isi nama area + pesan opsional  
   _“Mau ke sini, di sana hujan tidak?”_
3. Aplikasi menghasilkan tautan `/?request={id}`
4. Bagikan ke WhatsApp / media sosial

Pengguna yang membuka tautan akan:
- Langsung diarahkan ke lokasi terkait
- Melihat marker `❓`
- Dapat mengirim laporan untuk menjawab permintaan tersebut

Fitur ini dirancang sebagai mekanisme distribusi organik berbasis percakapan.

---

### 🌧️ Efek Hujan Visual

Jika terdapat cukup banyak laporan `heavy_rain` atau `flood` di sekitar area:
- Muncul efek hujan halus di atas peta
- Memberikan umpan balik visual bahwa area benar-benar “basah”

---

### 🌗 Tema Warm + Dark Mode

- Earth tone palette + **Plus Jakarta Sans**
- Light & Dark mode konsisten
- Tile CartoDB (Positron / Dark Matter) agar peta tetap bersih dan fokus

---

### 🛡️ Production-Ready (Bukan Sekadar Demo)

- Rate limiting berbasis IP
- Validasi koordinat (dibatasi wilayah Indonesia)
- Background job untuk menghapus data kedaluwarsa
- WebSocket dengan exponential backoff reconnect

---

## 🧱 Tech Stack

### Frontend
- Next.js 15 (App Router) + TypeScript
- React Leaflet + CartoDB tiles
- Tailwind (minimal) + styling kustom
- `next-themes` untuk theme management
- Framer Motion untuk animasi UI

### Backend
- Go + Fiber
- PostgreSQL + PostGIS (geospatial query)
- WebSocket selective broadcast (berbasis radius)
- Background job untuk expired cleanup
- Rate limiting sederhana (`golang.org/x/time/rate`)

### Infra
- Frontend: Vercel  
- Backend: Railway (Go + PostgreSQL + PostGIS)

---

## 🗺️ Arsitektur Singkat

### REST Endpoints

**Laporan Cuaca**
```

GET  /api/reports/nearby?lat=&lng=&radius=
POST /api/reports

```

**Permintaan Informasi**
```

GET  /api/requests/nearby?lat=&lng=&radius=
GET  /api/requests/:id
POST /api/requests

```

---

### Alur Share Link

1. `POST /api/requests`
2. Backend mengembalikan `id`
3. Frontend membentuk `/?request={id}`
4. Link dibagikan

---

### WebSocket

Client terkoneksi ke:

```

ws://.../ws?lat=&lng=

````

Backend hanya melakukan broadcast laporan baru ke klien dalam radius tertentu dari lokasi laporan tersebut.

---

### Data Lifecycle

- Setiap laporan memiliki `expires_at`
- Background job membersihkan data secara berkala
- Frontend juga memfilter data kedaluwarsa untuk menjaga UI tetap ringan

---

## 🚀 Menjalankan Secara Lokal

### 1️⃣ Backend (Go + Fiber)

```bash
cd backend
go mod tidy
````

#### Setup PostgreSQL

Buat database:

```sql
CREATE DATABASE tanyalangit;
```

Aktifkan PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Jalankan skrip SQL untuk membuat tabel:

* `reports`
* `location_requests`

#### `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tanyalangit
```

Jalankan server:

```bash
go run main.go
```

Backend berjalan di:

```
http://localhost:8080
```

---

### 2️⃣ Frontend (Next.js)

```bash
cd frontend
npm install
```

#### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

Jalankan:

```bash
npm run dev
```

Buka:

```
http://localhost:3000
```

---

## 🧠 Topik Diskusi Teknis (Untuk Interview)

Beberapa poin menarik untuk dibahas:

### 1. Geospatial Query dengan PostGIS

* `GEOGRAPHY(Point, 4326)`
* `ST_DWithin` untuk query radius
* Indeks GIST untuk performa

---

### 2. Trust Model untuk Crowdsourced Data

* Clustering laporan
* TTL 30 menit
* Penandaan *on-site reporter*
* Confidence berbasis konsensus lokal

---

### 3. Realtime System Design

* Selective broadcast berbasis radius
* Exponential backoff reconnect
* Trade-off antara polling vs WebSocket

---

### 4. Distribution Mechanism via Share Link

* Deep link berbasis context location
* UX yang kompatibel dengan alur WhatsApp
* Mengubah “tanya di grup” menjadi structured input

---

## 🛣️ Roadmap

* Web Push Notification untuk request baru dalam radius tertentu
* Sistem reputasi ringan tanpa akun penuh
* Mode komuter (menyimpan rute & cuaca sepanjang rute)
* Basic anomaly detection (misalnya laporan flood tunggal tanpa dukungan laporan lain)

---

## 👤 Credits

Dibangun sebagai proyek portofolio oleh
[@myfarism](https://github.com/myfarism)

Fokus utama proyek ini:

* Geospatial backend dengan PostGIS
* Realtime system dengan selective broadcast
* UX yang terasa lokal dan kontekstual

```

---

Kalau kamu mau, saya juga bisa bantu bikin versi README yang lebih “startup pitch style” (lebih storytelling & positioning), atau versi yang lebih “hardcore engineering” untuk target Big Tech interview.
```
