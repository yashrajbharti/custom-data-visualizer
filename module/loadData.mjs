/**
 * Data Loading Module
 *
 * Manages loading and organization of large datasets using:
 * - IndexedDB for persistent storage
 * - Web Workers for background processing
 * - Spatial compartments (8x8 grid = 64 compartments) for efficient rendering
 * - Batch loading to maintain 60 FPS performance
 *
 * The module supports 100K+ data points by loading only visible compartments
 * based on zoom level and viewport position.
 *
 * @module loadData
 */

import { convertToSphereCoords } from "./sphere.mjs";
import { render } from "./render.mjs";
import { getScreenCenterWorldCoords } from "./centerCoordinates.mjs";
import { getZoomScale } from "./store.mjs";
import { getCompartmentIndex } from "./compartments.mjs";
import { updateInfo } from "./info.mjs";

/** Maximum number of points to load initially for optimal performance */
const BATCH_SIZE = 5000;
let loadedCount = 0;

/** Total number of spatial compartments (8x8 grid) */
const NUM_COMPARTMENTS = 64;

/** Cache of originally loaded points */
let originalPoints = [];

/** Array of 64 compartments, each containing points in that spatial region */
let compartments = Array.from({ length: NUM_COMPARTMENTS }, () => []);

// Initialize Web Worker for background data processing
const worker = new Worker("./dataWorker.js");
worker.postMessage("startProcessing");

worker.onmessage = (event) => {
  if (event.data.type === "processedData") {
    compartments = event.data.compartments;
  }
};

/**
 * Loads initial batch of data from IndexedDB.
 *
 * Retrieves up to BATCH_SIZE (5000) points from IndexedDB, converts them
 * to 3D sphere coordinates, and renders them. This initial load ensures
 * smooth performance even with large datasets.
 *
 * @param {Array<Array<number>>} points - Array to populate with loaded points
 * @param {number} focusedIndex - Index of the focused point
 *
 * @example
 * const points = [];
 * loadStoredData(points, 0);
 * // points array will be populated with up to 5000 3D coordinates
 */
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

/**
 * Loads compartments visible in the current viewport.
 *
 * Based on zoom level and viewport center, determines which spatial compartments
 * should be loaded and displayed. At zoom >= 3, loads additional points from the
 * nearest compartment for increased detail.
 *
 * @param {Array<Array<number>>} points - Array to populate with visible points
 * @param {number} focusedIndex - Index of the focused point
 * @returns {Array<Array<number>>} Updated points array
 *
 * @example
 * // After zooming in
 * points = loadVisibleCompartments(points, focusedIndex);
 * // points now contains data from visible compartments only
 */
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

/**
 * Determines which compartments should be visible based on viewport.
 *
 * Uses zoom level to decide loading strategy:
 * - zoom <= 2.5: Returns all original points
 * - zoom >= 3: Returns nearest compartment + original points
 *
 * @param {Array<number>} viewCoords - World coordinates of viewport center [x, y, z]
 * @returns {Array<Array<Array<number>>>} Array of compartments to display
 * @private
 */
const determineVisibleCompartments = (viewCoords) => {
  const zoomScale = getZoomScale();
  if (zoomScale <= 2.5) return originalPoints;
  if (zoomScale >= 3) updateInfo("More points being added");

  const compartmentIndex = getCompartmentIndex(viewCoords);
  console.warn(compartmentIndex);

  return [compartments[compartmentIndex], originalPoints];
};
