const express = require("express");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const speedTest = require("speedtest-net");
const drivelist = require("drivelist");

const app = express();
const PORT = 3000;
const devmode = true;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

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

app.post("/network-check", (req, res) => {
  console.log("starting ping/trace");
  const target = req.body.ip;
  if (!target) return res.status(400).json({ error: "Target is required" });

  const isWindows = process.platform === "win32";
  const scriptPath = isWindows
    ? path.join(__dirname, "scripts/ping_trace.ps1")
    : path.join(__dirname, "scripts/ping_trace.sh");

  const args = [target];

  execFile(
    isWindows ? "powershell.exe" : "bash",
    [scriptPath, ...args],
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return res
          .status(500)
          .json({ error: "Script execution failed", details: stderr });
      }

      try {
        const output = JSON.parse(stdout);
        res.json(output);
      } catch (e) {
        res.status(500).json({ error: "Invalid script output", raw: stdout });
      }
    }
  );
});

app.get("/speedtest", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "speedtest.html"));
});

app.get("/speedtest-result", async (req, res) => {
  console.log("starting speedtest");
  try {
    const result = await speedTest({ acceptLicense: true, acceptGdpr: true });
    res.json({
      download: ((result.download.bandwidth * 8) / 1_000_000).toFixed(2),
      upload: ((result.upload.bandwidth * 8) / 1_000_000).toFixed(2),
      ping: result.ping.latency,
      packetLoss: result.packetLoss,
      isp: result.isp,
      server: result.server.name,
      location: result.server.location,
      country: result.server.country,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/removable-drives", async (req, res) => {
  try {
    const drives = await drivelist.list();

    const removableDrives = drives
      .filter((drive) => drive.isRemovable && drive.mountpoints.length > 0)
      .map((drive) => ({
        device: drive.device,
        description: drive.description,
        mountpoints: drive.mountpoints,
      }));

    res.json(removableDrives);
  } catch (err) {
    console.error("Error listing drives:", err);
    res.status(500).json({ error: "Failed to list removable drives" });
  }
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
