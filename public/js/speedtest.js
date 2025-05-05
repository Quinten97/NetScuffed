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

const startSpeedTest = () => startSpinner();
fetch("http://localhost:3000/speedtest-result")
  .then((data) => data.json())
  .then((data) => {
    console.log(data);
    document.getElementById("download").innerText = `${parseFloat(
      data.download
    ).toFixed(2)} Mbps`;
    document.getElementById("upload").innerText = `${parseFloat(
      data.upload
    ).toFixed(2)} Mbps`;
    document.getElementById("ping").innerText = `${Math.floor(data.ping)} ms`;
    document.getElementById("packetLoss").innerText = `${data.packetLoss}%`;
    document.getElementById("server").innerText = data.server;
    document.getElementById("isp").innerText = data.isp;
    document.getElementById("location").innerText = data.location;
    document.getElementById("country").innerText = data.country;
    stopSpinner();
  })
  .catch((error) => {
    console.error("Error:", error);
    stopSpinner();
  });
