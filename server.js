const express = require("express");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

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

app.get("/lldp-scan", (req, res) => {
  console.log("starting lldp scan");
  const isWindows = os.platform() === "win32";
  const scriptPath = isWindows
    ? path.join(__dirname, "scripts", "lldp.ps1")
    : path.join(__dirname, "scripts", "lldp.sh");

  const command = isWindows ? "powershell.exe" : scriptPath;
  const args = isWindows
    ? ["-ExecutionPolicy", "Bypass", "-File", scriptPath]
    : [];

  execFile(command, args, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr || err);
      return res.status(500).json({ error: "Failed to run script" });
    }

    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      console.error("Failed to parse output:", stdout);
      res.status(500).json({ error: "Invalid script output" });
    }
  });
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
