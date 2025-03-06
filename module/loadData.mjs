import { convertToSphereCoords } from "./sphere.mjs";
import { render } from "./render.mjs";

const BATCH_SIZE = 5000;
let loadedCount = 0;
const NUM_COMPARTMENTS = 64;
let compartments = Array.from({ length: NUM_COMPARTMENTS }, () => []);

const worker = new Worker("./dataWorker.mjs");
worker.postMessage("startProcessing");

worker.onmessage = (event) => {
  if (event.data.type === "processedData") {
    compartments = event.data.compartments;
  }
};

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
        render(points, focusedIndex);
      }
    };
  };
};

export const loadVisibleCompartments = (
  zoomLevel,
  viewCoords,
  points,
  focusedIndex
) => {
  const visibleCompartments = determineVisibleCompartments(
    zoomLevel,
    viewCoords
  );
  points.length = 0;

  visibleCompartments.forEach((compIndex) => {
    points.push(...compartments[compIndex]);
  });

  render(points, focusedIndex);
  return points;
};

const determineVisibleCompartments = (zoomLevel, viewCoords) => {
  return [
    /* array of visible compartment indexes */
  ];
};
