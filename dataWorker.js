import { getCompartmentIndex } from "./module/compartments.mjs";
import { convertToSphereCoords } from "./module/sphere.mjs";

const NUM_COMPARTMENTS = 64;
let compartments = Array.from({ length: NUM_COMPARTMENTS }, () => []);

self.onmessage = async (event) => {
  if (event.data === "startProcessing") {
    const dbRequest = indexedDB.open("largeDataDB", 1);

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction("data", "readonly");
      const store = transaction.objectStore("data");
      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const { x, y } = cursor.value;
          const sphereCoords = convertToSphereCoords(x, y);
          const compartmentIndex = getCompartmentIndex(sphereCoords);

          compartments[compartmentIndex].push(sphereCoords);
          cursor.continue();
        } else {
          self.postMessage({ type: "processedData", compartments });
        }
      };
    };
  }
};
