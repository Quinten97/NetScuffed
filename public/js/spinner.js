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

export { startSpinner, stopSpinner };
