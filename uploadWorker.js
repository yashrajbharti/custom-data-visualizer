self.onmessage = async (event) => {
  const { data } = event;
  if (data.type === "upload") {
    const { file } = data;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (
          !Array.isArray(jsonData) ||
          !jsonData.every((p) => p.x !== undefined && p.y !== undefined)
        ) {
          throw new Error(
            "Invalid JSON format! Expected an array of {x, y} points."
          );
        }
        indexedDB.deleteDatabase("largeDataDB");
        const dbRequest = indexedDB.open("largeDataDB", 1);
        dbRequest.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("data")) {
            db.createObjectStore("data", { keyPath: "id" });
          }
        };
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction("data", "readwrite");
          const store = transaction.objectStore("data");

          jsonData.forEach((point) => store.put(point));

          transaction.oncomplete = () => {
            self.postMessage({ type: "done", message: "Upload complete" });
          };

          transaction.onerror = () => {
            self.postMessage({ type: "error", message: "Upload failed" });
          };
        };
      } catch {
        self.postMessage({
          type: "error",
          message: "Upload Failed, JSON must contain id, x & y parameters",
        });
      }
    };
    reader.readAsText(file);
  }
};
