document.addEventListener("DOMContentLoaded", () => {
  const ssidSelect = document.getElementById("ssid");
  const connectBtn = document.getElementById("connectBtn");
  const passwordInput = document.getElementById("password");
  const refreshInfoBtn = document.getElementById("refreshInfoBtn");
  const networkInfoContainer = document.getElementById("networkInfo");

  connectBtn.disabled = true;
  connectBtn.classList.add("disabled");
  // Fetch available Wi-Fi networks
  async function loadNetworks() {
    try {
      const res = await fetch("/networks");
      const networks = await res.json();
      ssidSelect.innerHTML = `<option value="">Select Network</option>`;
      networks.forEach((net) => {
        const opt = document.createElement("option");
        opt.value = net.ssid;
        opt.textContent = `${net.ssid} (${net.quality}%)`;
        ssidSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load networks:", err);
    }
  }

  // Connect to selected network
  connectBtn.addEventListener("click", async () => {
    const ssid = ssidSelect.value;
    const password = passwordInput.value;
    if (!ssid) return alert("Please select a network.");

    try {
      const res = await fetch("/connect-network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid, password }),
      });

      const result = await res.json();
      if (result.success) {
        alert("Connected successfully!");
        loadCurrentConnection();
      } else {
        alert("Failed to connect: " + result.message);
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Error connecting to network.");
    }
  });

  // Fetch current connection info
  async function loadCurrentConnection() {
    try {
      const res = await fetch("/current-network");
      const data = await res.json();
      console.log(data);

      networkInfoContainer.innerHTML = "";

      data.interfaces.forEach((iface) => {
        const card = document.createElement("div");
        card.className = "iface-info";
        card.innerHTML = `
  <p><strong>Interface:</strong> ${iface.Interface}</p>
  <p><strong>Type:</strong> ${iface.Type}</p>
  <p><strong>IP Address:</strong> ${iface.IP}</p>
  <p><strong>MAC Address:</strong> ${iface.MAC}</p>
  <p><strong>Netmask:</strong> ${iface.Netmask}</p>
  <p><strong>Gateway:</strong> ${iface.Gateway || "--"}</p>
  ${iface.ssid ? `<p><strong>SSID:</strong> ${iface.SSID}</p>` : ""}
  ${iface.bssid ? `<p><strong>BSSID:</strong> ${iface.BSSID}</p>` : ""}
`;
        networkInfoContainer.appendChild(card);
      });
      connectBtn.disabled = false;
      connectBtn.classList.remove("disabled");
    } catch (err) {
      connectBtn.disabled = false;
      connectBtn.classList.remove("disabled");
      console.error("Failed to fetch connection info:", err);
      alert("Error loading network info.");
    }
  }

  refreshInfoBtn.addEventListener("click", loadCurrentConnection);

  // Initial load
  loadNetworks();
  loadCurrentConnection();
});

document
  .getElementById("disconnectWifiBtn")
  .addEventListener("click", async () => {
    if (confirm("Are you sure you want to disconnect from Wi-Fi?")) {
      try {
        const res = await fetch("/disconnect-wifi", {
          method: "POST",
        });
        const data = await res.json();
        alert(data.message || "Wi-Fi disconnected");
      } catch (err) {
        alert("Failed to disconnect Wi-Fi.");
        console.error(err);
      }
    }
  });
