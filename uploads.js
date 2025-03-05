const worker = new Worker("uploadWorker.js");

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    document.querySelector(".info").textContent = "Uploading...";
    worker.postMessage({ type: "upload", file });
  }
});

worker.onmessage = function (event) {
  if (event.data.type === "done") {
    document.querySelector(".info").textContent = event.data.message;
  }
};
