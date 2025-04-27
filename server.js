const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Route: Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Route: About page
app.get("/wifi", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "wifi.html"));
});

// Route: Contact page
app.get("/lldp", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "lldp.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
