fetch("http://localhost:3000/removable-drives")
  .then((res) => res.json())
  .then((drives) => {
    const select = document.getElementById("usbDropdown");
    drives.forEach((d) => {
      const label = `${d.description} - ${d.mountpoints[0].path}`;
      const option = new Option(label, d.mountpoints[0].path);
      select.add(option);
    });
  });
