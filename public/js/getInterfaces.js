function populateInterfaces() {
  fetch("http://localhost:3000/get-interfaces")
    .then((res) => res.json())
    .then(({ interfaces }) => {
      const select = document.getElementById("interface");

      // Clear existing options
      select.innerHTML = "";

      // Populate dynamically
      interfaces.forEach((iface) => {
        const option = document.createElement("option");
        option.value = iface.name; // the actual interface string
        option.textContent = iface.description || iface.name;
        select.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Failed to load interfaces:", err);
    });
}

// Call this function on page load
window.addEventListener("DOMContentLoaded", () => {
  populateInterfaces();
});
