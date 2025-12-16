🚑 WebGIS Sebaran Rumah Sakit & Simulasi Ambulans (Sukabumi)

Sistem Informasi Geografis (SIG) berbasis web yang memvisualisasikan sebaran fasilitas kesehatan (Rumah Sakit) di wilayah Sukabumi. Aplikasi ini dilengkapi dengan fitur Simulasi Pergerakan Ambulans interaktif yang memanfaatkan layanan routing untuk mencari jalur tercepat melewati jaringan jalan raya, serta integrasi data cuaca real-time.

🌟 Fitur Unggulan

Peta Interaktif & Layering Data:

Visualisasi batas wilayah kecamatan (Polygon) dengan informasi populasi.

Jaringan jalan raya utama (LineString).

Titik lokasi Rumah Sakit (Point) dengan radius layanan.

Kontrol layer untuk mengganti peta dasar (Base Map) dan menyembunyikan/menampilkan objek.

Simulasi Ambulans On-Demand:

Pengguna dapat mengklik lokasi darurat di peta.

Sistem otomatis mencari RS terdekat dan menghitung rute perjalanan.

Animasi ikon ambulans bergerak mengikuti lekuk jalan raya (bukan garis lurus).

Informasi Cuaca Real-Time:

Menampilkan suhu, kelembapan, dan kondisi cuaca aktual di lokasi pemetaan menggunakan OpenWeatherMap API.

🛠️ Teknologi & Tools

Aplikasi ini dibangun menggunakan teknologi open source berikut:

Backend (Server)

Node.js: Runtime environment utama.

Express.js: Framework web minimalis untuk menyajikan file statis (Frontend) dan menyediakan endpoint konfigurasi API Key.

Frontend (Client)

Leaflet.js: Library JavaScript utama untuk merender peta interaktif.

HTML5, CSS3, JavaScript (Vanilla): Membangun antarmuka pengguna yang responsif.

Layanan Pihak Ketiga (API)

OSRM (Open Source Routing Machine): Digunakan untuk fitur navigasi (Routing). API ini menghitung jalur geometri jalan raya antara lokasi ambulans dan lokasi tujuan.

Endpoint: https://router.project-osrm.org/

OpenWeatherMap API: Digunakan untuk mengambil data cuaca terkini berdasarkan koordinat peta.

📂 Sumber Data Geospasial

Seluruh data spasial yang digunakan dalam aplikasi ini bersumber dari data terbuka (Open Data):

Peta Dasar (Basemap):

© OpenStreetMap Contributors.

© OpenTopoMap (untuk tampilan topografi).

Jaringan Jalan Raya (jalan_raya.geojson):

Sumber: Diekspor dari OpenStreetMap menggunakan tools Overpass Turbo.

Query Ekspor:

/_ Query Overpass Turbo untuk mengambil jalan raya utama _/
[out:json][timeout:25];
(
// Mengambil jalan dengan tipe: Trunk, Primary, Secondary, Tertiary, Residential
way["highway"~"trunk|primary|secondary|Tertiary|Residential"]({{bbox}});
);
out body;

> ;
> out skel qt;

Batas Wilayah (kecamatan.geojson):

Data batas administrasi kecamatan di wilayah Sukabumi (Format GeoJSON Polygon).

Data Rumah Sakit (rumah_sakit.json):

Data titik koordinat dan atribut (Nama, Kelas RS) yang dikurasi secara manual dalam format JSON.

🚀 Panduan Instalasi & Menjalankan (Cloning)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

1. Prasyarat

Pastikan komputer Anda sudah terinstall:

Node.js (Saran: Versi LTS terbaru)

Git

2. Clone Repositori

Buka terminal/CMD dan jalankan perintah:

git clone [https://github.com/username-anda/nama-repo-anda.git](https://github.com/username-anda/nama-repo-anda.git)
cd nama-repo-anda

3. Install Dependencies

Instal paket yang diperlukan (Express, Cors, Dotenv):

npm install

Catatan: Jika sebelumnya terdapat sqlite3, pastikan sudah dihapus dengan npm uninstall sqlite3 karena versi ini menggunakan penyimpanan file JSON statis.

4. Konfigurasi API Key (Wajib)

Agar fitur cuaca berfungsi, Anda wajib memiliki API Key dari OpenWeatherMap.

Buat file baru bernama .env di folder utama proyek (sejajar dengan package.json).

Isi file .env dengan format berikut:

OPENWEATHER_API_KEY=masukkan_api_key_anda_disini

5. Jalankan Server

Jalankan aplikasi dengan perintah:

node gps-server.js

Jika berhasil, akan muncul pesan:

🚀 Server WebGIS Standby di http://localhost:3000
📂 Mode: Simulasi On-Demand

6. Akses Aplikasi

Buka browser (Chrome/Edge/Firefox) dan kunjungi: http://localhost:3000

🌤️ Panduan Mendapatkan API Key OpenWeather

Ikuti langkah ini untuk mendapatkan kunci akses API cuaca secara gratis:

Kunjungi situs resmi OpenWeatherMap.

Klik tombol Sign In atau Create an Account jika belum punya akun.

Setelah login, klik nama profil Anda di pojok kanan atas, lalu pilih menu My API Keys.

Anda akan melihat Key default yang sudah dibuatkan, atau klik tombol "Generate" untuk membuat yang baru.

Salin (Copy) kode kunci tersebut.

Tempel (Paste) ke dalam file .env di proyek Anda (lihat langkah instalasi no. 4).

Catatan: API Key baru biasanya membutuhkan waktu 10-60 menit untuk aktif sepenuhnya.

🤝 Struktur Folder

📂 root-project/
┣ 📂 data/ # Menyimpan data JSON & GeoJSON (RS, Jalan, Kecamatan)
┣ 📂 public/ # File Frontend (HTML, CSS, JS)
┃ ┣ 📂 assets/ # Ikon Ambulans (.svg)
┃ ┣ 📜 index.html
┃ ┣ 📜 script.js
┃ ┗ 📜 style.css
┣ 📜 .env # File Konfigurasi API Key (JANGAN DI-UPLOAD KE GITHUB)
┣ 📜 gps-server.js # File Server Utama (Backend)
┣ 📜 package.json # Daftar Dependencies
┗ 📜 README.md # Dokumentasi Proyek

Disclaimer: Proyek ini dibuat untuk tujuan edukasi dan simulasi. Data routing menggunakan server demo publik OSRM yang memiliki batasan penggunaan (rate limit).
