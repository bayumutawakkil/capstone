<div align="center">
  <img src="https://placehold.co/800x200/4f46e5/ffffff?text=NowPlaying+Media+Tracker" alt="NowPlaying Banner" />
  
  # 🎮 NowPlaying
  **Comprehensive Media & Literacy Tracker**

  <p>Lacak, ukur, dan analisis seluruh konsumsi hiburan dan literasi Anda dalam satu platform yang elegan. Dari Game, Anime, Buku, Komik, hingga Film & Serial TV.</p>
</div>

---

## 🚀 Fitur Utama

### 1. Pencarian Sentralisasi Lintas Platform (Unified API Search)
Tambahkan koleksi baru tanpa perlu mengetik manual. *NowPlaying* mengambil data langsung dari pangkalan data dunia menggunakan beberapa API berstandar industri:
- 🎮 **Game:** RAWG API
- 🍿 **Film & Serial TV:** TMDB (The Movie Database) API
- 📚 **Buku:** Google Books API
- ⛩️ **Anime & Komik (Manga/Manhwa):** Anilist GraphQL API (Super Cepat & Stabil)

### 2. Active Tracker & Quick Actions
Sistem *Tabbing SPA (Single Page Application)* yang mulus memastikan navigasi tanpa henti. Di dalam **Tab Active Tracker**, sistem membedakan perlakuan aksi secara pintar:
- **Media Episodik (Anime, Komik, Buku):** Memiliki tombol *"Quick Increment"* (+1 Episode, +1 Chapter, +10 Halaman) yang akan langsung menaikkan *progress bar* mingguan.
- **Media Durasi (Game, Film):** Terhubung ke fitur *Session Timer* (Stopwatch). Anda bisa menghidupkan *timer* saat bermain, dan begitu dihentikan, total waktu yang Anda investasikan akan langsung dicatat ke dalam analitik harian.

### 3. Lifestyle Analytics (Data Reaktif)
Lacak kebiasaan konsumsi Anda melalui bagan interaktif yang ditenagai oleh **Recharts**:
- **Daily Milestone Progress Bar:** Memacu semangat literasi Anda. Jika target harian (misal: 20 unit/hari) tercapai, progres bar akan memancarkan efek *Emerald glow*.
- **Media Distribution (PieChart):** Diagram kue yang menyeimbangkan portofolio hiburan Anda secara proporsional.
- **Tren Konsumsi 7 Hari (BarChart):** Mengkalkulasi rekam jejak penyelesaian (unit baca/tonton) harian secara historis dari database.

### 4. History Journal (The Archive)
Bagi karya yang telah tamat atau Anda tinggalkan (drop). Sematkan **Rating Apresiasi 1-5 Bintang** beserta dengan ulasan singkat. Jurnal riwayat Anda disimpan secara permanen dengan antarmuka yang sedikit lebih redup untuk kesan masa lalu yang berkesan.

### 5. ✨ NowPlaying Wrapped (Fitur Premium)
Hanya dengan sekali klik, munculkan *Modal Pop-up* bergaya **Spotify Wrapped**. Algoritma akan menghitung perjalanan Anda dan menampilkan infografis memukau berdesain *glassmorphism*:
- Total Koleksi Terselesaikan
- **Raja Genre (Top Niche)** 
- Total Volume Literasi Raksasa
- Rata-Rata Apresiasi

---

## 🛠️ Stack Teknologi

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Glassmorphism UI, Dark Mode Default, Micro-animations)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Data Visualisation:** Recharts
- **Iconography:** Lucide React
- **Testing:** Playwright E2E

---

## 💾 Struktur Database (Supabase)

Agar aplikasi ini dapat berjalan 100%, ada dua tabel esensial yang mengikat aplikasi di dalam PostgreSQL Supabase:

### 1. `media_items`
Tabel penyimpan koleksi portofolio pengguna:
- `units_completed` (Int) - Menyimpan progres harian/episodik
- `time_invested` (Real) - Menyimpan waktu yang dihabiskan dari Stopwatch
- `review_text` (Text) - Catatan usai penamatan karya
- `start_date` & `end_date` (Timestamp) - Rentang waktu konsumsi
- `genre` (Text) - Metadata khusus untuk algoritma Wrapped

### 2. `session_logs`
Tabel pencatat sejarah *(Event logger)* yang mengawasi grafik mingguan agar persisten:
- `units_added` & `time_added_seconds`
- `created_at` (menjadi jangkar waktu untuk *BarChart* tren seminggu terakhir).

---

## 🏗️ Instalasi & Menjalankan (Local Development)

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/username/nowplaying.git
   cd nowplaying
   ```

2. **Instalasi Dependencies:**
   ```bash
   npm install
   ```

3. **Pengaturan Variabel Lingkungan (.env.local):**
   Pastikan Anda memasukkan *Keys* Supabase dan TMDB Anda.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Jalankan Server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di *browser*.

---

*NowPlaying - Lacak tanpa batas, apresiasi setiap karya.* 🌠
