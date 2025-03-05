self.onmessage = async function (event) {
  const { data } = event;
  if (data.type === "upload") {
    const { file } = data;
    const reader = new FileReader();
    reader.onload = async function (e) {
      const jsonData = JSON.parse(e.target.result);

      const dbRequest = indexedDB.open("largeDataDB", 1);
      dbRequest.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("data")) {
          db.createObjectStore("data", { keyPath: "id" });
        }
      };
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("data", "readwrite");
        const store = transaction.objectStore("data");

        jsonData.forEach((point) => store.put(point));

        self.postMessage({ type: "done", message: "Upload complete" });
      };
    };
    reader.readAsText(file);
  }
};
