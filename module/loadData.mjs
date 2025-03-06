import { convertToSphereCoords } from "./sphere.mjs";
import { render } from "./render.mjs";

const BATCH_SIZE = 5000;
let loadedCount = 0;

export const loadStoredData = (points, focusedIndex) => {
  const dbRequest = indexedDB.open("largeDataDB", 1);

  dbRequest.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction("data", "readonly");
    const store = transaction.objectStore("data");
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor && loadedCount < BATCH_SIZE) {
        points.push(convertToSphereCoords(cursor.value.x, cursor.value.y));
        loadedCount++;
        cursor.continue();
      } else {
        // console.log(`Loaded ${points.length} points`);
        render(points, focusedIndex);
      }
    };
  };
};
