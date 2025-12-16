# 🚑 WebGIS Sebaran Rumah Sakit & Simulasi Ambulans (Sukabumi)

![Status](https://img.shields.io/badge/Status-Active-success)
![Node](https://img.shields.io/badge/Node.js-v14%2B-green)
![License](https://img.shields.io/badge/License-ISC-blue)

Sistem Informasi Geografis (SIG) berbasis web yang memvisualisasikan sebaran fasilitas kesehatan (Rumah Sakit) di wilayah Sukabumi. Aplikasi ini dilengkapi dengan fitur **Simulasi Pergerakan Ambulans** interaktif yang memanfaatkan layanan _routing_ untuk mencari jalur tercepat melewati jaringan jalan raya, serta integrasi data cuaca _real-time_.

## 🌟 Fitur Unggulan

1.  **Peta Interaktif & Layering Data**:
    - Visualisasi batas wilayah kecamatan (Polygon) dengan informasi populasi.
    - Jaringan jalan raya utama (LineString).
    - Titik lokasi Rumah Sakit (Point) dengan radius layanan.
    - Kontrol layer untuk mengganti peta dasar (_Base Map_) dan menyembunyikan/menampilkan objek.
2.  **Simulasi Ambulans On-Demand**:
    - Pengguna dapat mengklik lokasi darurat di peta.
    - Sistem otomatis mencari RS terdekat dan menghitung rute perjalanan.
    - Animasi ikon ambulans bergerak mengikuti lekuk jalan raya (bukan garis lurus).
3.  **Informasi Cuaca Real-Time**:
    - Menampilkan suhu, kelembapan, dan kondisi cuaca aktual di lokasi pemetaan menggunakan OpenWeatherMap API.

## 🛠️ Teknologi & Tools

Aplikasi ini dibangun menggunakan teknologi _open source_ berikut:

### Backend (Server)

- **Node.js**: _Runtime environment_ utama.
- **Express.js**: Framework web minimalis untuk menyajikan file statis (Frontend) dan menyediakan endpoint konfigurasi API Key.

### Frontend (Client)

- **Leaflet.js**: Library JavaScript utama untuk merender peta interaktif.
- **HTML5, CSS3, JavaScript (Vanilla)**: Membangun antarmuka pengguna yang responsif.

### Layanan Pihak Ketiga (API)

- **OSRM (Open Source Routing Machine)**: Digunakan untuk fitur navigasi (_Routing_). API ini menghitung jalur geometri jalan raya antara lokasi ambulans dan lokasi tujuan.
  - _Endpoint:_ `https://router.project-osrm.org/`
- **OpenWeatherMap API**: Digunakan untuk mengambil data cuaca terkini berdasarkan koordinat peta.

---

## 📂 Sumber Data Geospasial

Seluruh data spasial yang digunakan dalam aplikasi ini bersumber dari data terbuka (_Open Data_):

1.  **Peta Dasar (Basemap)**:

    - © [OpenStreetMap](https://www.openstreetmap.org/copyright) Contributors.
    - © OpenTopoMap (untuk tampilan topografi).

2.  **Jaringan Jalan Raya (`jalan_raya.geojson`)**:

    - **Sumber**: Diekspor dari OpenStreetMap menggunakan tools **Overpass Turbo**.
    - **Query Ekspor**:
      ```c
      /* Query Overpass Turbo untuk mengambil jalan raya utama */
      [out:json][timeout:25];
      (
        // Mengambil jalan dengan tipe: Trunk, Primary, Secondary, Tertiary, Residential
        way["highway"~"trunk|primary|secondary|Tertiary|Residential"]({{bbox}});
      );
      out body;
      >;
      out skel qt;
      ```

3.  **Batas Wilayah (`kecamatan.geojson`)**:

    - Data batas administrasi kecamatan di wilayah Sukabumi (Format GeoJSON Polygon).

4.  **Data Rumah Sakit (`rumah_sakit.json`)**:
    - Data titik koordinat dan atribut (Nama, Kelas RS) yang dikurasi secara manual dalam format JSON.

---

## 🚀 Panduan Instalasi & Menjalankan (Cloning)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda:

### 1. Prasyarat

Pastikan komputer Anda sudah terinstall:

- [Node.js](https://nodejs.org/) (Saran: Versi LTS terbaru)
- Git

### 2. Clone Repositori

Buka terminal/CMD dan jalankan perintah:

```bash
git clone https://github.com/username-anda/nama-repo-anda.git
cd nama-repo-anda
```

### 3. Install Dependencies

Instal paket yang diperlukan (Express, Cors, Dotenv):

```bash

npm install
```

Catatan: Jika sebelumnya terdapat sqlite3, pastikan sudah dihapus dengan npm uninstall sqlite3 karena versi ini menggunakan penyimpanan file JSON statis.

### 4. Konfigurasi API Key (Wajib)

Agar fitur cuaca berfungsi, Anda wajib memiliki API Key dari OpenWeatherMap.

- Buat file baru bernama .env di folder utama proyek (sejajar dengan package.json).

- Isi file .env dengan format berikut:

```bash
OPENWEATHER_API_KEY=masukkan_api_key_anda_disini
```

### 5. Jalankan Server

Jalankan aplikasi dengan perintah:

```bash
node gps-server.js
```

Jika berhasil, akan muncul pesan:

🚀 Server WebGIS Standby di http://localhost:3000 📂 Mode: Simulasi On-Demand

### 6. Akses Aplikasi

Buka browser (Chrome/Edge/Firefox) dan kunjungi: http://localhost:3000

---

## 🌤️ Panduan Mendapatkan API Key OpenWeather

Ikuti langkah ini untuk mendapatkan kunci akses API cuaca secara gratis:

1.  Kunjungi situs resmi [OpenWeatherMap](https://openweathermap.org/).
2.  Klik tombol **Sign In** atau **Create an Account** jika belum punya akun.
3.  Setelah login, klik nama profil Anda di pojok kanan atas, lalu pilih menu **My API Keys**.
4.  Anda akan melihat _Key_ default yang sudah dibuatkan, atau klik tombol "Generate" untuk membuat yang baru.
5.  **Salin (Copy)** kode kunci tersebut.
6.  **Tempel (Paste)** ke dalam file `.env` di proyek Anda (lihat langkah instalasi no. 4).

_Catatan: API Key baru biasanya membutuhkan waktu 10-60 menit untuk aktif sepenuhnya._

---

## 🤝 Struktur Folder

```text
📂 root-project/
 ┣ 📂 data/               # Menyimpan data JSON & GeoJSON (RS, Jalan, Kecamatan)
 ┣ 📂 public/             # File Frontend (HTML, CSS, JS)
 ┃ ┣ 📂 assets/           # Ikon Ambulans (.svg)
 ┃ ┣ 📜 index.html
 ┃ ┣ 📜 script.js
 ┃ ┗ 📜 style.css
 ┣ 📜 .env                # File Konfigurasi API Key (JANGAN DI-UPLOAD KE GITHUB)
 ┣ 📜 gps-server.js       # File Server Utama (Backend)
 ┣ 📜 package.json        # Daftar Dependencies
 ┗ 📜 README.md           # Dokumentasi Proyek
```
