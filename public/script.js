/**
 * FILE: public/script.js
 * UPDATE: Support file .geojson & Layering Kecamatan
 */

// --- 1. SETUP PETA & GLOBAL VARIABLES ---
const map = L.map("map").setView([-6.921, 106.925], 13);

const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
}).addTo(map);

const topoLayer = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution: "© OpenTopoMap",
  }
);

// Setup Layer Control (Menu Ganti Layer)
// Kita simpan di variabel agar bisa menambah overlay secara dinamis nanti
const baseMaps = {
  "Peta Jalan (OSM)": osmLayer,
  "Topografi (DEM)": topoLayer,
};
const overlayMaps = {}; // Nanti diisi otomatis saat data dimuat
const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// Icon & Variables
const ambIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/263/263058.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
let allHospitals = [];
let weatherApiKey = "";
let isSimulationMode = false;
let activeSimulations = [];

// --- 2. FUNGSI LOAD SEMUA LAYER DATA ---
async function loadLayerData() {
  // A. LAYER 1: KECAMATAN (Polygon) - Paling Bawah
  // File: data/kecamatan.geojson
  try {
    const resKec = await fetch("/data/kecamatan.geojson");
    if (resKec.ok) {
      const dataKec = await resKec.json();

      // Style untuk Kecamatan (Warna Transparan)
      const kecStyle = {
        color: "#f39c12", // Warna Garis (Oranye)
        weight: 2, // Tebal Garis
        opacity: 1,
        fillColor: "#f1c40f", // Warna Isi (Kuning)
        fillOpacity: 0.1, // Transparan banget biar peta kelihatan
      };

      const layerKecamatan = L.geoJSON(dataKec, {
        style: kecStyle,
        onEachFeature: function (feature, layer) {
          // Tampilkan Nama Kecamatan jika ada di properties
          if (feature.properties && feature.properties.nama) {
            layer.bindPopup(`<b>Kecamatan:</b> ${feature.properties.nama}`);
          } else if (feature.properties && feature.properties.kecamatan) {
            layer.bindPopup(
              `<b>Kecamatan:</b> ${feature.properties.kecamatan}`
            );
          }
        },
      });

      // Tambahkan ke Peta & Layer Control
      layerKecamatan.addTo(map);
      layerControl.addOverlay(layerKecamatan, "Batas Kecamatan");
      console.log("✅ Layer Kecamatan dimuat.");
    }
  } catch (e) {
    console.error("Gagal load kecamatan:", e);
  }

  // B. LAYER 2: JALAN RAYA (Line) - Di Atas Kecamatan
  // File: data/jalan_raya.geojson (Format Baru)
  try {
    const resJalan = await fetch("/data/jalan_raya.geojson"); // <--- Ekstensi .geojson
    if (resJalan.ok) {
      const dataJalan = await resJalan.json();

      const layerJalan = L.geoJSON(dataJalan, {
        style: {
          color: "#7f8c8d", // Abu-abu
          weight: 2,
          opacity: 0.6,
        },
      });

      layerJalan.addTo(map);
      layerControl.addOverlay(layerJalan, "Jaringan Jalan");
      console.log("✅ Layer Jalan Raya dimuat.");
    }
  } catch (e) {
    console.error("Gagal load jalan:", e);
  }

  // C. LAYER 3: RUMAH SAKIT (Point) - Paling Atas
  // File: data/rumah_sakit.json (Tetap json karena ini data kita sendiri)
  try {
    const resRS = await fetch("/data/rumah_sakit.json");
    if (resRS.ok) {
      allHospitals = await resRS.json();

      // Kita bungkus dalam LayerGroup agar bisa di on/off sekaligus
      const groupRS = L.layerGroup();

      allHospitals.forEach((rs) => {
        const marker = L.marker(rs.loc);
        marker.bindPopup(`<b>${rs.nama}</b><br>${rs.kelas}`);

        const circle = L.circle(rs.loc, {
          color: rs.color,
          fillColor: rs.color,
          fillOpacity: 0.1,
          radius: 1000,
        });

        // Masukkan ke grup
        marker.addTo(groupRS);
        circle.addTo(groupRS);
      });

      groupRS.addTo(map);
      layerControl.addOverlay(groupRS, "Rumah Sakit");
      console.log("✅ Layer RS dimuat.");
    }
  } catch (e) {
    console.error("Gagal load RS:", e);
  }
}

// Panggil Fungsi Load
loadLayerData();

// --- 3. FITUR SIMULASI ON-DEMAND (KLIK USER) ---
// (Bagian ini tidak berubah, tetap sama seperti sebelumnya)

function toggleSimulationMode() {
  isSimulationMode = !isSimulationMode;
  const btn = document.getElementById("btn-mode");
  const mapContainer = document.getElementById("map");

  if (isSimulationMode) {
    btn.innerHTML =
      '<i class="fas fa-check-circle"></i> Mode Aktif (Klik Peta)';
    btn.classList.add("mode-active");
    mapContainer.classList.add("cursor-crosshair");
  } else {
    btn.innerHTML = '<i class="fas fa-plus-circle"></i> Mode Tambah Ambulans';
    btn.classList.remove("mode-active");
    mapContainer.classList.remove("cursor-crosshair");
  }
}

function clearSimulations() {
  activeSimulations.forEach((sim) => {
    map.removeLayer(sim.marker);
    map.removeLayer(sim.line);
    clearInterval(sim.timer);

    // Hapus Kartu UI
    const card = document.getElementById(`card-${sim.id}`);
    if (card) card.remove();
  });
  activeSimulations = [];
  document.getElementById("btn-reset").style.display = "none";
}

map.on("click", function (e) {
  if (!isSimulationMode) return;

  const startLat = e.latlng.lat;
  const startLng = e.latlng.lng;
  const nearestRS = findNearestHospital(startLat, startLng);

  if (nearestRS) {
    document.getElementById("btn-reset").style.display = "block";
    getRouteAndAnimate(
      startLat,
      startLng,
      nearestRS.loc[0],
      nearestRS.loc[1],
      nearestRS.nama
    );
  }
});

function findNearestHospital(lat, lng) {
  let nearest = null;
  let minDistance = Infinity;
  allHospitals.forEach((rs) => {
    const dist = map.distance([lat, lng], rs.loc);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = rs;
    }
  });
  return nearest;
}

// Logika Routing OSRM & UI Panel
async function getRouteAndAnimate(startLat, startLng, endLat, endLng, rsName) {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const routeCoords = data.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);
      const simId = Date.now();
      const randomColor =
        "#" + Math.floor(Math.random() * 16777215).toString(16);

      const routeLine = L.polyline(routeCoords, {
        color: randomColor,
        weight: 5,
        opacity: 0.8,
        dashArray: "10, 5",
      }).addTo(map);

      const newMarker = L.marker(routeCoords[0], { icon: ambIcon }).addTo(map);
      newMarker
        .bindPopup(`<b>Unit #${simId}</b><br>Tujuan: ${rsName}`)
        .openPopup();

      createAmbulanceCard(simId, rsName, randomColor);

      const simData = {
        id: simId,
        marker: newMarker,
        line: routeLine,
        timer: null,
        destination: [endLat, endLng],
      };
      activeSimulations.push(simData);

      animateMarker(newMarker, routeCoords, simData);
    }
  } catch (err) {
    console.error("Routing Error:", err);
  }
}

function createAmbulanceCard(id, rsName, color) {
  const container = document.getElementById("ambulance-list");
  const card = document.createElement("div");
  card.id = `card-${id}`;
  card.className = "amb-card";
  card.style.borderLeftColor = color;

  card.innerHTML = `
        <h4 style="color:${color}">🚑 Unit #${id.toString().slice(-4)}</h4>
        <p><b>Tujuan:</b> ${rsName}</p>
        <p><i class="fas fa-route"></i> Sisa Jarak: <span id="dist-${id}">...</span></p>
        <p class="status-text" id="status-${id}">Meluncur...</p>
    `;
  container.appendChild(card);
}

function animateMarker(marker, pathCoordinates, simData) {
  let detailedPath = [];
  const steps = 3;
  for (let i = 0; i < pathCoordinates.length - 1; i++) {
    const start = pathCoordinates[i];
    const end = pathCoordinates[i + 1];
    for (let j = 0; j < steps; j++) {
      const lat = start[0] + (end[0] - start[0]) * (j / steps);
      const lng = start[1] + (end[1] - start[1]) * (j / steps);
      detailedPath.push([lat, lng]);
    }
  }

  let index = 0;
  simData.timer = setInterval(() => {
    if (index >= detailedPath.length) {
      clearInterval(simData.timer);
      marker.bindPopup("<b>Sampai di Tujuan!</b>").openPopup();

      const statusText = document.getElementById(`status-${simData.id}`);
      if (statusText) {
        statusText.innerText = "TIBA DI LOKASI";
        statusText.style.color = "green";
      }
      setTimeout(() => {
        const card = document.getElementById(`card-${simData.id}`);
        if (card) card.remove();
      }, 5000);
      return;
    }
    marker.setLatLng(detailedPath[index]);

    // Update Jarak UI
    const distMeters = map.distance(detailedPath[index], simData.destination);
    const distKm = (distMeters / 1000).toFixed(2);
    const distElement = document.getElementById(`dist-${simData.id}`);
    if (distElement) distElement.innerText = `${distKm} km`;

    index++;
  }, 50);
}

// --- 4. INTEGRASI CUACA ---
async function fetchWeather() {
  try {
    const configRes = await fetch("/api/config");
    const config = await configRes.json();
    weatherApiKey = config.apiKey;

    if (!weatherApiKey) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=-6.9210&lon=106.9250&appid=${weatherApiKey}&units=metric&lang=id`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      const wBox = document.getElementById("weather-box");
      if (wBox) {
        wBox.style.display = "block";
        document.getElementById("w-temp").innerText = Math.round(
          data.main.temp
        );
        document.getElementById(
          "w-desc"
        ).innerText = `(${data.weather[0].description})`;
      }
    }
  } catch (e) {
    console.error("Cuaca error:", e);
  }
}
fetchWeather();

// --- 5. LEGENDA PETA ---
const legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  const div = L.DomUtil.create("div", "info legend");
  div.style.backgroundColor = "white";
  div.style.padding = "10px";
  div.style.borderRadius = "5px";
  div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
  div.style.fontSize = "12px";
  div.style.lineHeight = "1.5";
  div.innerHTML += "<h4>Legenda Peta</h4>";
  div.innerHTML +=
    '<i style="background: red; width: 10px; height: 10px; display: inline-block; border-radius: 50%; margin-right: 5px;"></i> RS Rujukan Utama<br>';
  div.innerHTML +=
    '<i style="background: green; width: 10px; height: 10px; display: inline-block; border-radius: 50%; margin-right: 5px;"></i> RS Lainnya<br>';
  div.innerHTML +=
    '<i style="background: #f1c40f; opacity:0.5; width: 10px; height: 10px; display: inline-block; margin-right: 5px;"></i> Wilayah Kecamatan<br>';
  div.innerHTML += '<hr style="margin: 5px 0;">';
  div.innerHTML +=
    '<i style="border-top: 2px solid #7f8c8d; width: 20px; display: inline-block; margin-right: 5px;"></i> Jalan Raya<br>';
  div.innerHTML +=
    '<i style="border-top: 3px dashed blue; width: 20px; display: inline-block; margin-right: 5px;"></i> Rute Simulasi<br>';
  return div;
};
legend.addTo(map);
