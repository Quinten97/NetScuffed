import { startSpinner, stopSpinner } from "./spinner.js";

document.getElementById("scanForm").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("form submitted");
  startSpinner();

  const target = document.getElementById("target").value;
  const scanType = document.getElementById("scanType").value;
  const ports = document.getElementById("ports").value;
  const outputPath = document.getElementById("usbDropdown").value;

  const scanOptions = {
    target,
    scanType,
    ports,
    outputPath,
  };

  fetch("http://localhost:3000/run-nmap", {
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
      alert("Scan complete! Output written to USB.");
    })
    .catch((err) => {
      stopSpinner();
      alert("A network error occurred. See console.");
      console.error("Scan failed:", err);
    });
});
