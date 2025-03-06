import { getEventCoordinates } from "./eventCoordinates.mjs";
import { render } from "./render.mjs";
import { enableButton, disableButton } from "./buttonState.mjs";
import { inverseMatrix, applyMatrix } from "./matrixUtils.mjs";
import { rotationMatrix } from "./rotateMatrix.mjs";
import { updateInfo } from "./info.mjs";
import { getNestingDepth } from "./getNestedDepth.mjs";

let dragging = false;
let dragIndex = -1;
let inverseRotateMatrix = inverseMatrix(rotationMatrix());
let nestTimeout = null;

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

export const onMove = (event, points, focusedIndex) => {
  if (dragging && dragIndex !== -1) {
    const [x, y, z] = getEventCoordinates(event);
    const [invX, invY, invZ] = applyMatrix([x, y, z], inverseRotateMatrix);
    if (!isNaN(invX) && !isNaN(invY)) points[dragIndex] = [invX, invY, invZ];
    render(points, focusedIndex);

    clearTimeout(nestTimeout);
    let dataPoints;
    nestTimeout = setTimeout(
      () => (dataPoints = attemptNesting(points, dragIndex)),
      1200
    );
    if (dataPoints) return dataPoints;
  }
};

export const onEnd = () => {
  dragging = false;
  dragIndex = -1;
  clearTimeout(nestTimeout);
};

export const attemptNesting = (points, index) => {
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
        updateInfo(`Nested a dot at level ${getNestingDepth(parent)}`, 1200);
        render(points, i, true);
        return points;
      }
    }
  }
};

export const burstNestedDotByOneLevel = (points, index) => {
  const point = points[index];
  if (point.children && point.children.length > 0) {
    points.push(...point.children);
    point.children = [];
    updateInfo("Bursted a dot", 1200);
    render(points, index, true);
    return points;
  }
};
