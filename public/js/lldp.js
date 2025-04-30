const scanButton = document.getElementById("start-lldp");

const lldpScan = () => {
  console.log("Scan Started");
  fetch("http://localhost:3000/lldp-scan")
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      const duplexMode =
        data.NetworkAdapter.FullDuplex === true ? "Full Duplex" : "Half Duplex";
      console.log(data);
      document.getElementById("device-name").innerText =
        "Device Name: " + data.LLDPInfo[0].SystemName;
      document.getElementById("device-port").innerText =
        "Port ID: " + data.LLDPInfo[0].PortID;
      document.getElementById("device-MAC").innerText =
        "Chassis ID: " + data.LLDPInfo[0].ChassisID;
      document.getElementById("device-speed").innerText =
        "Speed: " + data.NetworkAdapter.LinkSpeed;
      document.getElementById("device-duplex").innerText =
        "Duplex Mode: " + duplexMode;
    })
    .catch((error) => console.error(error));
};
