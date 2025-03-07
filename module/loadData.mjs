import { convertToSphereCoords } from "./sphere.mjs";
import { render } from "./render.mjs";
import { getScreenCenterWorldCoords } from "./centerCoordinates.mjs";
import { getZoomScale } from "./store.mjs";
import { getCompartmentIndex } from "./compartments.mjs";
import { updateInfo } from "./info.mjs";

const BATCH_SIZE = 5000;
let loadedCount = 0;
const NUM_COMPARTMENTS = 64;
let originalPoints = [];
let compartments = Array.from({ length: NUM_COMPARTMENTS }, () => []);

const worker = new Worker("./dataWorker.js");
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
        originalPoints = [...points];
        render(points, focusedIndex);
      }
    };
  };
};

export const loadVisibleCompartments = (points, focusedIndex) => {
  const viewCoords = getScreenCenterWorldCoords();
  const visibleCompartments = determineVisibleCompartments(viewCoords);

  points.length = 0;
  visibleCompartments.forEach((compartment) => {
    if (compartment) {
      points.push(...compartment);
    }
  });

  render(points, focusedIndex, true);
  return points;
};

const determineVisibleCompartments = (viewCoords) => {
  const zoomScale = getZoomScale();
  if (zoomScale <= 2.5) return originalPoints;
  if (zoomScale >= 3) updateInfo("More points being added");

  const compartmentIndex = getCompartmentIndex(viewCoords);
  console.warn(compartmentIndex);

  return [compartments[compartmentIndex], originalPoints];
};
