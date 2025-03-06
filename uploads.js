const worker = new Worker("uploadWorker.js");

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    document.querySelector(".info").textContent = "Uploading...";
    worker.postMessage({ type: "upload", file });
  }
});

worker.onmessage = (event) => {
  if (event.data.type === "done") {
    document.querySelector(".file").style.display = "flex";
    document.querySelector(".info").textContent = event.data.message;
  } else if (event.data.type === "error") {
    document.querySelector(".file").style.display = "none";
    document.querySelector(".info").textContent = event.data.message;
  }
};
