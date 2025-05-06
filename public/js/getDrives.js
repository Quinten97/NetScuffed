function fetchDrives() {
  fetch("http://localhost:3000/removable-drives")
    .then((res) => res.json())
    .then((drives) => {
      const select = document.getElementById("usbDropdown");
      select.innerHTML = "";

      drives.forEach((d) => {
        if (d.mountpoints.length > 0) {
          const label = `${d.description} - ${d.mountpoints[0].path}`;
          const option = new Option(label, d.mountpoints[0].path);
          select.add(option);
        }
      });
    })
    .catch((err) => {
      console.error("Failed to fetch drives:", err);
    });
}

// Run on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchDrives();
  setInterval(fetchDrives, 2000); // Repeat every 5 seconds
});
