import { startSpinner, stopSpinner } from "./spinner.js";

document.getElementById("tsharkForm").addEventListener("submit", (e) => {
  e.preventDefault();
  startSpinner();

  const scanOptions = {
    interface: document.getElementById("interface").value,
    captureFilter: document.getElementById("captureFilter").value,
    duration: document.getElementById("duration").value,
    outputFormat: document.getElementById("outputFormat").value,
    outputPath: document.getElementById("usbDropdown").value,
  };

  fetch("http://localhost:3000/run-tshark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scanOptions),
  })
    .then(async (res) => {
      stopSpinner();
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }
      alert("Capture complete! File saved to USB.");
    })
    .catch((err) => {
      stopSpinner();
      alert("Error occurred, check console.");
      console.error("Capture failed:", err);
    });
});
