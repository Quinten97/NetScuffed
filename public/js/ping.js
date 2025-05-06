import { startSpinner, stopSpinner } from "./spinner.js";

document.getElementById("runBtn").addEventListener("click", async () => {
  startSpinner();
  const targetInput = document.getElementById("target");
  const target = targetInput.value.trim();

  if (!target) {
    alert("Please enter a valid IP address or hostname.");
    return;
  }

  try {
    const response = await fetch("/network-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip: target }),
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      throw new Error(data.error || "Unknown error occurred.");
    }

    // Update Ping Panel
    if (data.ping?.error) {
      document.getElementById("pingTime").textContent = "--";
      document.getElementById("packetLoss").textContent = "--";
      alert("Ping failed: " + data.ping.error);
    } else {
      document.getElementById("pingTime").textContent =
        data.ping.responseTime?.toFixed(2) + " ms";
      document.getElementById("packetLoss").textContent =
        data.ping.packetLoss?.toFixed(2) + "%";
    }

    // Update Traceroute Panel
    const hopsList = document.getElementById("hopsList");
    hopsList.innerHTML = "";

    if (Array.isArray(data.traceroute) && data.traceroute.length > 0) {
      data.traceroute.forEach((hop) => {
        const p = document.createElement("p");
        p.textContent = `${hop.trim().slice(0, 1)}: ${hop.trim().slice(1)}`;
        hopsList.appendChild(p);
      });

      document.getElementById("hopCount").textContent = data.traceroute.length;
    } else {
      document.getElementById("hopCount").textContent = "0";
      const p = document.createElement("p");
      p.textContent = "No traceroute data available.";
      hopsList.appendChild(p);
    }
    stopSpinner();
  } catch (err) {
    stopSpinner();
    console.error("Error:", err);
    alert("Failed to fetch network data: " + err.message);
  }
});
