const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/wifi", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "wifi.html"));
});

app.get("/lldp", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "lldp.html"));
});

app.get("/ping", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "ping.html"));
});

app.get("/speedtest", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "speedtest.html"));
});

app.get("/nmap", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "nmap.html"));
});

app.get("/wireshark", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "wireshark.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
