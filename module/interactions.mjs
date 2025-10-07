/**
 * Interaction Module
 *
 * Handles all user interactions with data points including:
 * - Drag and drop functionality
 * - Point nesting (combining points)
 * - Point bursting (expanding nested points)
 * - Touch and mouse event handling
 *
 * The module uses inverse rotation matrices to convert screen coordinates
 * to world coordinates for accurate point selection and manipulation.
 *
 * @module interactions
 */

import { getEventCoordinates } from "./eventCoordinates.mjs";
import { render } from "./render.mjs";
import { enableButton, disableButton } from "./buttonState.mjs";
import { inverseMatrix, applyMatrix } from "./matrixUtils.mjs";
import { rotationMatrix } from "./rotateMatrix.mjs";
import { updateInfo } from "./info.mjs";

// Interaction state
let dragging = false;
let dragIndex = -1;
let inverseRotateMatrix = inverseMatrix(rotationMatrix());
let nestTimeout = null;

/**
 * Initiates dragging interaction for a data point.
 *
 * Converts screen coordinates to world coordinates using inverse rotation matrix,
 * finds the closest point within threshold distance (0.05 units), and sets up
 * the drag state. Also manages undo/redo history.
 *
 * @param {MouseEvent|TouchEvent} event - The mouse or touch event
 * @param {Array<Array<number>>} points - Array of all data points
 * @param {number} focusedIndex - Currently focused point index
 * @param {Array} history - Undo history stack
 * @param {Array} redoStack - Redo history stack
 * @returns {[Array, Array, number]} Updated [history, redoStack, focusedIndex]
 *
 * @example
 * const [newHistory, newRedo, newFocus] = startDragging(
 *   mouseEvent,
 *   points,
 *   0,
 *   history,
 *   redoStack
 * );
 */
export const startDragging = (
  event,
  points,
  focusedIndex,
  history,
  redoStack
) => {
  const [x, y, z] = getEventCoordinates(event);
  inverseRotateMatrix = inverseMatrix(rotationMatrix());

  const [invX, invY, invZ] = applyMatrix([x, y, z], inverseRotateMatrix);

  dragIndex = points.findIndex(
    (p) => Math.hypot(p[0] - invX, p[1] - invY, p[2] - invZ) < 0.05
  );
  if (dragIndex !== -1) {
    focusedIndex = dragIndex;
    dragging = true;
    history.push(JSON.parse(JSON.stringify(points)));
    redoStack = [];
    enableButton("undo");
    disableButton("redo");
  }
  return [history, redoStack, focusedIndex];
};

/**
 * Handles point movement during drag operation.
 *
 * Updates the dragged point's position based on cursor/touch movement.
 * Automatically triggers nesting attempt after 1200ms of hovering over another point.
 *
 * @param {MouseEvent|TouchEvent} event - The move event
 * @param {Array<Array<number>>} points - Array of all data points
 * @param {number} focusedIndex - Currently focused point index
 * @returns {Array<Array<number>>|undefined} Updated points array if nesting occurred
 *
 * @example
 * const updatedPoints = onMove(mouseMoveEvent, points, focusedIndex);
 * if (updatedPoints) points = updatedPoints;
 */
export const onMove = (event, points, focusedIndex) => {
  if (dragging && dragIndex !== -1) {
    const [x, y, z] = getEventCoordinates(event);
    const [invX, invY, invZ] = applyMatrix([x, y, z], inverseRotateMatrix);
    if (!isNaN(invX) && !isNaN(invY)) points[dragIndex] = [invX, invY, invZ];
    render(points, focusedIndex);

    clearTimeout(nestTimeout);
    let dataPoints;
    nestTimeout = setTimeout(
      () => ([dataPoints, _] = attemptNesting(points, dragIndex, focusedIndex)),
      1200
    );
    if (dataPoints) return dataPoints;
  }
};

/**
 * Ends the dragging interaction.
 *
 * Resets drag state and clears any pending nesting timeout.
 * Called on mouseup, touchend, or when drag is cancelled.
 */
export const onEnd = () => {
  dragging = false;
  dragIndex = -1;
  clearTimeout(nestTimeout);
};

/**
 * Attempts to nest a point inside another point.
 *
 * Checks if the dragged point is within nesting distance (0.05 units) of any other point.
 * If so, adds the dragged point as a child of the target point and removes it from
 * the main points array. Supports deep nesting (nested points can have children).
 *
 * @param {Array<Array<number>>} points - Array of all data points
 * @param {number} index - Index of the point to nest
 * @param {number} [focusedIndex=index] - Currently focused point index
 * @returns {[Array<Array<number>>, number]|undefined} [Updated points, new focused index] if nesting occurred
 *
 * @example
 * const [updatedPoints, newFocusIndex] = attemptNesting(points, dragIndex, focusedIndex);
 * if (updatedPoints) {
 *   points = updatedPoints;
 *   focusedIndex = newFocusIndex;
 * }
 */
export const attemptNesting = (points, index, focusedIndex = index) => {
  const draggedPoint = points[index];
  for (let i = 0; i < points.length; i++) {
    if (i !== index) {
      const parent = points[i];
      const distance = Math.hypot(
        parent[0] - draggedPoint[0],
        parent[1] - draggedPoint[1],
        parent[2] - draggedPoint[2]
      );
      if (distance < 0.05) {
        if (!parent.children) parent.children = [];
        parent.children.push(draggedPoint);
        points.splice(index, 1);
        if (index < i) i--; // because removal of a dot changes index
        focusedIndex = i;
        updateInfo("Nested a dot", 1200);
        render(points, i, true);
        return [points, i];
      }
    }
  }
};

/**
 * Bursts (expands) a nested point, extracting all its children.
 *
 * Recursively extracts all nested children from a point and adds them back
 * to the main points array. This operation flattens the entire nesting hierarchy
 * of the selected point.
 *
 * @param {Array<Array<number>>} points - Array of all data points
 * @param {number} index - Index of the point to burst
 * @returns {Array<Array<number>>|undefined} Updated points array if bursting occurred
 *
 * @example
 * // Burst a nested point
 * const updatedPoints = burstNestedDot(points, focusedIndex);
 * if (updatedPoints) {
 *   points = updatedPoints;
 *   // All nested children are now separate points
 * }
 */
export const burstNestedDot = (points, index) => {
  const point = points[index];

  if (point.children && point.children.length > 0) {
    /**
     * Recursively extracts all children from a nested point.
     * @param {Array<number>} dot - The point to extract children from
     * @returns {Array<Array<number>>} Array of all extracted children
     */
    const extractChildren = (dot) => {
      if (dot.children && dot.children.length > 0) {
        const nestedDots = [...dot.children];
        dot.children = [];
        return nestedDots.concat(nestedDots.flatMap(extractChildren));
      }
      return [];
    };
    const allChildren = extractChildren(point);
    points.push(...allChildren);
    updateInfo("Bursted a dot", 1200);
    render(points, index, true);
    return points;
  }
};
