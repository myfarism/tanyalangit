```md
# 🌧️ TanyaLangit

Cuaca hyperlocal yang diisi manusia, bukan hanya satelit.  
Saat akan berangkat ke suatu daerah dan ragu: **“di sana sekarang hujan deras atau tidak?”**, TanyaLangit mencoba menjawab pertanyaan tersebut melalui laporan langsung dari orang yang berada di lokasi.

Website: [text](https://tanyalangit.vercel.app/)

![Demo](./docs/demo.gif)

---

## Latar belakang

Sebagian besar aplikasi cuaca hanya memberikan informasi seperti *“40% chance of rain”* yang sering kali tidak cukup membantu dalam pengambilan keputusan praktis.  
Kebutuhan yang lebih nyata adalah jawaban sederhana: **“di sana sekarang hujan atau tidak?”**

TanyaLangit hadir sebagai eksperimen untuk:
- Mengumpulkan laporan cuaca langsung dari manusia yang berada di lokasi tersebut
- Menggunakan pengelompokan laporan (clustering) untuk memberikan indikasi *confidence* berdasarkan jumlah kontributor
- Menyediakan fitur *“Minta Info”* yang dapat dibagikan melalui tautan (misalnya ke grup WhatsApp)

---

## Fitur utama

- 🔴 **Laporan cuaca real‑time**
  - Klik pada peta, pilih kondisi: cerah, mendung, gerimis, hujan lebat, banjir
  - Setiap laporan aktif selama 30 menit kemudian otomatis kedaluwarsa

- 🧠 **Confidence berdasarkan jumlah laporan**
  - Laporan dalam area yang berdekatan dikelompokkan (cluster)
  - Ikon cuaca membesar dan menampilkan badge jumlah laporan
  - Laporan dari *on‑site reporter* (pengguna yang mengonfirmasi sedang berada di lokasi) diberi penanda visual khusus

- ❓ **“Minta Info” dengan tautan yang dapat dibagikan**
  - Klik di peta → tab **Minta Info**
  - Isi nama area dan pesan opsional (misalnya: *“Mau ke sini, di sana hujan tidak?”*)
  - Aplikasi menghasilkan tautan yang dapat dibagikan ke WhatsApp atau media sosial
  - Pengguna yang membuka tautan tersebut:
    - Langsung diarahkan ke area terkait di peta
    - Melihat marker `❓` di lokasi yang dimaksud
    - Dapat mengirim laporan cuaca untuk menjawab permintaan tersebut

- 🌧️ **Efek hujan visual berbasis laporan**
  - Jika terdapat cukup banyak laporan `heavy_rain` atau `flood` di sekitar, muncul efek hujan halus di atas peta
  - Menjadi umpan balik visual bahwa area tersebut sedang benar‑benar “basah”

- 🌗 **Tema warm + lokal dengan dark mode**
  - Palet warna earth tone dengan tipografi Plus Jakarta Sans
  - Tema terang dan gelap yang konsisten
  - Menggunakan tile CartoDB (Positron / Dark Matter) agar peta tetap bersih dan mudah dibaca

- 🛡️ **Siap produksi (bukan sekadar demo)**
  - Rate limiting per IP untuk endpoint penting
  - Validasi input koordinat (dibatasi ke wilayah Indonesia)
  - Background job di backend untuk menghapus data kedaluwarsa (reports & requests)
  - WebSocket dengan mekanisme exponential backoff saat reconnect

---

## Tech stack

**Frontend**
- Next.js 15 (App Router) + TypeScript
- React Leaflet + CartoDB tiles
- Tailwind (seperlunya) + styling kustom
- `next-themes` untuk pengelolaan tema
- Framer Motion untuk animasi UI

**Backend**
- Go + Fiber
- WebSocket broadcast ke klien dalam radius tertentu
- PostgreSQL + PostGIS untuk geospatial query
- Background job untuk pembersihan data (expired cleanup)
- Rate limiting sederhana berbasis IP (`golang.org/x/time/rate`)

**Infra**
- Frontend: Vercel  
- Backend: Railway (Go Fiber + PostgreSQL + PostGIS)

---

## Arsitektur singkat

Frontend berkomunikasi dengan backend melalui endpoint:

- Laporan cuaca:
  - `GET /api/reports/nearby?lat=&lng=&radius=`
  - `POST /api/reports`
- Permintaan informasi lokasi:
  - `GET /api/requests/nearby?lat=&lng=&radius=`
  - `GET /api/requests/:id`
  - `POST /api/requests`

Alur *share link*:

1. Pengguna membuat request melalui `POST /api/requests`
2. Backend mengembalikan `id` request
3. Frontend membentuk tautan `/?request={id}`
4. Tautan tersebut dibagikan (misalnya via WhatsApp)

WebSocket:

- Klien terkoneksi ke `ws://.../ws?lat=&lng=`
- Backend hanya melakukan broadcast laporan baru ke klien yang berada dalam radius tertentu dari lokasi laporan tersebut

Data laporan disimpan dengan kolom `expires_at` dan dibersihkan secara berkala oleh background job. Frontend juga mem-filter laporan dan request yang kedaluwarsa agar UI tetap ringan dan relevan.

---

## Menjalankan secara lokal

### 1. Backend (Go + Fiber)

```bash
cd backend
go mod tidy
```

Setup database PostgreSQL:

1. Buat database, misalnya `tanyalangit`
2. Aktifkan PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Jalankan skrip SQL untuk membuat tabel `reports` dan `location_requests`.

Isi file `.env`:

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

Service akan berjalan pada `http://localhost:8080`.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
```

Isi `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

Jalankan dev server:

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## Poin teknis yang menarik untuk dibahas

Beberapa hal yang secara khusus menarik untuk didiskusikan di interview teknis:

1. **Geospatial query dengan PostGIS**  
   Penggunaan `GEOGRAPHY(Point, 4326)` dan `ST_DWithin` untuk query radius, serta pemanfaatan indeks GIST agar performa tetap terjaga saat data bertambah.

2. **Model kepercayaan (trust model) untuk data crowdsourced**  
   - Pengelompokan laporan per area dan kondisi cuaca
   - Penandaan *on‑site reporter*  
   - TTL 30 menit untuk menjaga relevansi data

3. **Realtime dengan WebSocket**  
   - Selektif: hanya klien dalam radius tertentu yang menerima laporan baru  
   - Exponential backoff untuk reconnect agar tidak membebani server saat koneksi bermasalah

4. **Fitur “Minta Info” sebagai mekanisme distribusi**  
   - Tautan shareable yang dirancang untuk alur penggunaan WhatsApp  
   - Pengalaman pengguna yang masuk melalui tautan langsung diarahkan ke konteks lokasi yang tepat

---

## Roadmap

Beberapa ide pengembangan berikutnya:

- Web Push Notification untuk pengguna yang mengizinkan notifikasi jika ada request baru di radius tertentu
- Sistem reputasi ringan untuk reporter tanpa perlu akun penuh
- Mode “komuter”: menyimpan rute harian dan menampilkan cuaca di sepanjang rute tersebut

---

## Credits

Dibangun sebagai proyek portofolio oleh [@myfarism](https://github.com/myfarism).  
Fokus utamanya adalah menunjukkan kombinasi antara geospatial backend, realtime system, dan desain antarmuka yang terasa dekat dengan pengguna lokal.