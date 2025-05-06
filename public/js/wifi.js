import { stopSpinner, startSpinner } from "./spinner.js";

const wifiscan = () => {
  startSpinner();
  fetch("http://localhost:3000/wifi-scan")
    .then((response) => response.json())
    .then((data) => {
      const networksContainer = document.getElementById("networks-container");
      networksContainer.innerHTML = ""; // Clear previous results

      // Sort by SignalPercent descending
      const sortedNetworks = data.sort(
        (a, b) => b.SignalPercent - a.SignalPercent
      );

      // Create and append elements for each network
      sortedNetworks.forEach((network) => {
        const networkDiv = document.createElement("div");
        networkDiv.classList.add("network");

        let signalColor = "gray";
        const dBm = network.dBm;

        if (dBm >= -60) {
          signalColor = "green";
        } else if (dBm >= -90) {
          signalColor = "goldenrod";
        }

        networkDiv.innerHTML = `
            <strong>SSID:</strong> ${network.SSID}<br>
            <strong>Signal:</strong>
            <div class="signal-bar">
            <div class="signal-fill" style="width: ${network.SignalPercent}%; background-color: ${signalColor};"></div>
            </div>
            ${network.SignalPercent}% (${network.dBm} dBm)<br>
            <strong>Channel:</strong> ${network.Channel} (${network.Band})<br>
            <strong>Encryption:</strong> ${network.Encryption}<br>
            <strong>MAC:</strong> ${network.MACAddress}
        `;

        networksContainer.appendChild(networkDiv);
        stopSpinner();
      });
    })
    .catch((error) => {
      console.error("WiFi scan failed:", error);
    });
};

document.getElementById("start-wifi").addEventListener("click", wifiscan);
