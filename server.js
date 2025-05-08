const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const speedTest = require("speedtest-net");
const drivelist = require("drivelist");
const { spawn } = require("child_process");
const wifi = require("node-wifi");

const app = express();
const PORT = 3000;
const devmode = true;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Init node-wifi
wifi.init({
  iface: null, // auto-detect interface
});

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

app.post("/run-nmap", (req, res) => {
  console.log("starting nmap");
  const { target, scanType, ports, outputPath } = req.body;

  if (!target) {
    return res.status(400).json({ error: "Missing target" });
  }
  if (!scanType) {
    return res.status(400).json({ error: "Missing scan type" });
  }
  if (!outputPath) {
    return res.status(400).json({ error: "No Removable Drive selected" });
  }

  const args = [scanType];
  if (ports) args.push("-p", ports);
  args.push(target);

  execFile("nmap", args, (err, stdout, stderr) => {
    if (err) {
      console.error("Scan error:", err);
      return res.status(500).json({ error: "Scan failed." });
    }

    const filePath = path.join(outputPath, `nmap-scan-${Date.now()}.txt`);

    fs.writeFile(filePath, stdout, (writeErr) => {
      if (writeErr) {
        console.error("Write error:", writeErr);
        return res.status(500).json({ error: "Failed to write to USB." });
      }

      res.json({ message: "Scan complete", file: filePath });
    });
  });
});

app.get("/wireshark", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "wireshark.html"));
});

app.post("/run-tshark", (req, res) => {
  const { interface, captureFilter, duration, outputFormat, outputPath } =
    req.body;
  console.log(req.body);

  if (!interface) return res.status(400).json({ error: "Missing interface" });
  if (!duration || isNaN(duration))
    return res.status(400).json({ error: "Invalid duration" });
  if (!outputFormat)
    return res.status(400).json({ error: "Missing output format" });
  if (!outputPath)
    return res.status(400).json({ error: "No Removable Drive selected" });

  const timestamp = Date.now();
  const filename = `tshark-capture-${timestamp}.${
    outputFormat === "pcap" ? "pcap" : "txt"
  }`;
  const filePath = path.join(outputPath, filename);

  // Build tshark args
  const args = ["-i", interface, "-a", `duration:${duration}`];
  if (captureFilter) args.push("-f", captureFilter);
  if (outputFormat === "pcap") {
    args.push("-w", filePath);
  } else {
    args.push("-V");
  }

  const tshark = spawn("tshark", args);

  let output = "";
  let error = "";

  if (outputFormat === "txt") {
    tshark.stdout.on("data", (data) => (output += data));
  }

  tshark.stderr.on("data", (data) => (error += data));

  tshark.on("close", (code) => {
    if (code !== 0) {
      console.error("TShark error:", error);
      return res.status(500).json({ error: "TShark failed to run." });
    }

    if (outputFormat === "txt") {
      fs.writeFile(filePath, output, (err) => {
        if (err) {
          console.error("Write error:", err);
          return res
            .status(500)
            .json({ error: "Failed to write capture to USB." });
        }
        res.json({ message: "Capture complete", file: filePath });
      });
    } else {
      res.json({ message: "Capture complete", file: filePath });
    }
  });
});

app.get("/get-interfaces", (req, res) => {
  execFile("tshark", ["-D"], (error, stdout, stderr) => {
    if (error) {
      console.error("Error listing interfaces:", stderr || error.message);
      return res.status(500).json({ error: "Failed to list interfaces" });
    }

    const interfaces = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\.\s+([^\s]+)\s+\((.+)\)/);
        return match
          ? { index: match[1], name: match[2], description: match[3] }
          : null;
      })
      .filter(Boolean);

    res.json({ interfaces });
  });
});

app.get("/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "settings.html"));
});

app.get("/networks", async (req, res) => {
  try {
    const networks = await wifi.scan();
    res.json(networks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/connect-network", async (req, res) => {
  const { ssid, password } = req.body;
  try {
    await wifi.connect({ ssid, password });
    res.json({ success: true, message: `Connected to ${ssid}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/disconnect-wifi", (req, res) => {
  wifi.disconnect((error) => {
    if (error) {
      console.error("Wi-Fi disconnect error:", error);
      return res.status(500).json({ message: "Failed to disconnect Wi-Fi." });
    } else {
      console.log("Wi-Fi disconnected.");
      return res.json({ message: "Wi-Fi disconnected successfully." });
    }
  });
});

app.get("/current-network", async (req, res) => {
  const scriptPath = path.join(__dirname, "./scripts/network-info.ps1");

  execFile(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath],
    (err, stdout, stderr) => {
      if (err) {
        console.error("PowerShell error:", err);
        return res
          .status(500)
          .json({ error: "Failed to retrieve network info." });
      }

      try {
        const data = JSON.parse(stdout);
        res.json({ interfaces: data });
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr);
        console.error("Raw output:", stdout);
        res
          .status(500)
          .json({ error: "Invalid output from PowerShell script." });
      }
    }
  );
});

// End Routes ------------------------------------------------------------------------------>

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
