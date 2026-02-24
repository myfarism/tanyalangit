# 🌧️ TanyaLangit

**Cuaca hyperlocal yang diisi manusia, bukan hanya satelit.**

Saat hendak bepergian ke suatu daerah dan muncul pertanyaan sederhana:

> **“Di sana sekarang hujan atau tidak?”**

TanyaLangit mencoba menjawabnya melalui laporan langsung dari orang yang benar-benar berada di lokasi tersebut.

🔗 Website: [https://tanyalangit.vercel.app/](https://tanyalangit.vercel.app/)

---

# 📌 Latar Belakang

Sebagian besar aplikasi cuaca menampilkan informasi seperti *“40% chance of rain”*.
Namun dalam banyak situasi, yang dibutuhkan adalah jawaban yang lebih praktis dan langsung:

> **Apakah di sana sedang hujan sekarang?**

TanyaLangit adalah eksperimen untuk membangun sistem cuaca berbasis kontribusi manusia (crowdsourced), dengan fokus pada:

* Laporan real-time dari pengguna di lokasi
* Indikator *confidence* berbasis jumlah laporan
* Distribusi permintaan informasi melalui tautan yang mudah dibagikan (misalnya ke WhatsApp)

---

# ✨ Fitur Utama

## 1️⃣ Laporan Cuaca Real-Time

* Klik pada peta
* Pilih kondisi:

  * ☀️ Cerah
  * ☁️ Mendung
  * 🌦️ Gerimis
  * 🌧️ Hujan lebat
  * 🌊 Banjir
* Setiap laporan aktif selama **30 menit**
* Laporan otomatis kedaluwarsa setelah melewati TTL

---

## 2️⃣ Confidence Berbasis Jumlah Laporan

* Laporan yang berdekatan akan **dikelompokkan (cluster)**
* Ikon membesar sesuai jumlah laporan
* Badge menampilkan total kontributor
* *On-site reporter* (pengguna yang mengonfirmasi berada di lokasi) diberi penanda visual khusus

Tujuannya: meningkatkan kepercayaan tanpa sistem akun yang kompleks.

---

## 3️⃣ Fitur “Minta Info” (Shareable Link)

Alur penggunaan:

1. Klik lokasi pada peta
2. Pilih tab **Minta Info**
3. Isi:

   * Nama area
   * Pesan opsional (misalnya: *“Mau ke sini, di sana hujan tidak?”*)
4. Sistem menghasilkan tautan berbentuk:

   ```
   /?request={id}
   ```
5. Tautan dapat dibagikan ke WhatsApp atau media sosial

Pengguna yang membuka tautan akan:

* Langsung diarahkan ke lokasi terkait
* Melihat marker `❓`
* Dapat mengirim laporan untuk menjawab permintaan tersebut

Fitur ini dirancang sebagai mekanisme distribusi organik.

---

## 4️⃣ Efek Visual Berbasis Laporan

Jika terdapat cukup banyak laporan:

* `heavy_rain`
* `flood`

di suatu area, maka muncul efek hujan ringan di atas peta sebagai umpan balik visual bahwa area tersebut sedang “basah”.

---

## 5️⃣ UI Lokal dengan Dark Mode

* Palet warna earth tone
* Tipografi Plus Jakarta Sans
* Mode terang & gelap yang konsisten
* Tile peta CartoDB:

  * Positron (light)
  * Dark Matter (dark)

Fokus desain: hangat, lokal, tidak terasa seperti dashboard meteorologi formal.

---

## 6️⃣ Siap Produksi

Bukan sekadar demo UI.

* Rate limiting per IP untuk endpoint sensitif
* Validasi koordinat (dibatasi ke wilayah Indonesia)
* Background job untuk membersihkan data kedaluwarsa
* WebSocket dengan exponential backoff saat reconnect

---

# 🏗️ Arsitektur Sistem

## Gambaran Umum

Frontend dan backend berkomunikasi melalui REST API + WebSocket.

### Endpoint Laporan Cuaca

```
GET  /api/reports/nearby?lat=&lng=&radius=
POST /api/reports
```

### Endpoint Permintaan Informasi

```
GET  /api/requests/nearby?lat=&lng=&radius=
GET  /api/requests/:id
POST /api/requests
```

---

## 🔁 Alur Share Link

1. Frontend → `POST /api/requests`
2. Backend → mengembalikan `id`
3. Frontend → membentuk URL `/?request={id}`
4. URL dibagikan ke pengguna lain

---

## 🔌 WebSocket

Koneksi:

```
ws://.../ws?lat=&lng=
```

Karakteristik:

* Broadcast selektif: hanya klien dalam radius tertentu yang menerima laporan baru
* Reconnect dengan exponential backoff
* Mengurangi beban server saat gangguan jaringan

---

## 🗄️ Model Data

* Lokasi disimpan sebagai `GEOGRAPHY(Point, 4326)`
* Query radius menggunakan `ST_DWithin`
* Indeks GIST untuk menjaga performa
* Kolom `expires_at` untuk TTL
* Background job melakukan cleanup berkala

Frontend juga memfilter data kedaluwarsa untuk menjaga UI tetap ringan.

---

# 🧰 Tech Stack

## Frontend

* Next.js 15 (App Router) + TypeScript
* React Leaflet
* Tailwind CSS (minimal)
* next-themes
* Framer Motion

## Backend

* Go + Fiber
* PostgreSQL + PostGIS
* WebSocket radius-based broadcast
* Background cleanup worker
* Rate limiting (`golang.org/x/time/rate`)

## Infrastruktur

* Frontend: Vercel
* Backend: Railway
* Database: PostgreSQL + PostGIS

---

# 🚀 Menjalankan Secara Lokal

## 1️⃣ Backend

```bash
cd backend
go mod tidy
```

Buat database:

```sql
CREATE DATABASE tanyalangit;
CREATE EXTENSION IF NOT EXISTS postgis;
```

Isi `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tanyalangit
```

Jalankan:

```bash
go run main.go
```

Backend berjalan di:

```
http://localhost:8080
```

---

## 2️⃣ Frontend

```bash
cd frontend
npm install
```

Isi `.env.local`:

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

# 🗺️ Roadmap

* Web Push Notification berbasis radius
* Sistem reputasi ringan tanpa akun penuh
* Mode komuter (menyimpan rute harian dan melihat cuaca sepanjang rute)
* Eksperimen deteksi anomali laporan

---

# 👤 Credits

Dibangun sebagai proyek portofolio oleh:
[https://github.com/myfarism](https://github.com/myfarism)