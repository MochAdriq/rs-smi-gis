/**
 * FILE: gps-server.js
 * FUNGSI: Server WebGIS (Mode: Simulation Only)
 * - Melayani File Frontend & Data JSON
 * - Menyediakan API Config (Keamanan)
 * - TIDAK ADA LAGI background tracking otomatis
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.static("public")); // Frontend
app.use("/data", express.static(path.join(__dirname, "data"))); // Folder Data JSON

// API Config (Keamanan API Key Cuaca)
app.get("/api/config", (req, res) => {
  res.json({
    apiKey: process.env.OPENWEATHER_API_KEY || "",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server WebGIS Standby di http://localhost:${port}`);
  console.log(`📂 Mode: Simulasi On-Demand (Manual Digitasi Dinonaktifkan)`);
});
