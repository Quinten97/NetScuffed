const express = require("express");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");

const app = express();
const PORT = 3000;
const devmode = true;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

//start kiosk-------------------------------------------------------------------------->
const powershellPath =
  "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
const scriptPath = path.join(__dirname, "start.ps1");

devmode === false &&
  execFile(
    powershellPath,
    ["-ExecutionPolicy", "Bypass", "-File", scriptPath],
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error launching Chrome: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`PowerShell stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(`PowerShell stdout: ${stdout}`);
      }
    }
  );

//--------------------------Routes----------------------------------------------------->
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/wifi", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "wifi.html"));
});

app.get("/wifi-scan", (req, res) => {
  console.log("starting wifi scan");
  const isWindows = os.platform() === "win32";
  const scriptPath = isWindows
    ? path.join(__dirname, "scripts", "wifi.ps1")
    : path.join(__dirname, "scripts", "wifi.sh");

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
      console.log("wifi scan complete: success");
    } catch (e) {
      console.error("Failed to parse output:", stdout);
      res.status(500).json({ error: "Invalid script output" });
      console.log("wifi scan complete: failed or partially failed");
    }
  });
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
      console.log("lldp scan complete: success");
    } catch (e) {
      console.error("Failed to parse output:", stdout);
      res.status(500).json({ error: "Invalid script output" });
      console.log("lldp scan complete: failed or partially failed");
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
// End Routes ------------------------------------------------------------------------------>

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
