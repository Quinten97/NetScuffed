let spinnerInterval;

const startSpinner = () => {
  const spinnerFrames = ["|", "/", "-", "\\"];
  let index = 0;
  const spinnerElement = document.getElementById("loading-indicator");
  spinnerElement.style.display = "block";
  spinnerInterval = setInterval(() => {
    spinnerElement.innerText = spinnerFrames[index];
    index = (index + 1) % spinnerFrames.length;
  }, 150);
};

const stopSpinner = () => {
  clearInterval(spinnerInterval);
  document.getElementById("loading-indicator").style.display = "none";
};

const scanButton = document.getElementById("start-lldp");

const lldpScan = () => {
  console.log("Scan Started");

  // Start spinner
  startSpinner();

  // Set loading state
  document.getElementById("device-name").innerText = "Device Name: Loading...";
  document.getElementById("device-port").innerText = "Port ID: Loading...";
  document.getElementById("device-MAC").innerText = "Chassis ID: Loading...";
  document.getElementById("device-speed").innerText = "Speed: Loading...";
  document.getElementById("device-duplex").innerText =
    "Duplex Mode: Loading...";

  fetch("http://localhost:3000/lldp-scan")
    .then((response) => response.json())
    .then((data) => {
      stopSpinner(); // ✅ Stop spinner

      const lldpInfo =
        data.LLDPInfo && data.LLDPInfo.length > 0 ? data.LLDPInfo[0] : null;
      const adapter = data.NetworkAdapter || {};

      const linkSpeed = adapter.LinkSpeed || "0 bps";
      const duplex =
        adapter.FullDuplex === true
          ? "Full Duplex"
          : adapter.FullDuplex === false
          ? "Half Duplex"
          : "Unknown";

      document.getElementById("device-name").innerText =
        "Device Name: " + (lldpInfo?.SystemName || "Unknown");
      document.getElementById("device-port").innerText =
        "Port ID: " + (lldpInfo?.PortID || "Unknown");
      document.getElementById("device-MAC").innerText =
        "Chassis ID: " + (lldpInfo?.ChassisID || "Unknown");
      document.getElementById("device-speed").innerText = "Speed: " + linkSpeed;
      document.getElementById("device-duplex").innerText =
        "Duplex Mode: " + duplex;

      if (linkSpeed === "0 bps") {
        alert("No Ethernet connection detected. Please check the cable.");
      } else if (!lldpInfo) {
        alert(
          "Ethernet is connected, but no LLDP info was found. This may indicate a bad line, unsupported switch, or disabled LLDP on the network."
        );
      }
    })
    .catch((error) => {
      stopSpinner(); // ✅ Stop on error
      console.error(error);
      alert("Failed to run LLDP scan. Please try again.");
    });
};
