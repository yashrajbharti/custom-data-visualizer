import { getEventCoordinates } from "./eventCoordinates.mjs";
import { render } from "./render.mjs";
import { enableButton, disableButton } from "./buttonState.mjs";
import { inverseMatrix, applyMatrix } from "./matrixUtils.mjs";
import { rotationMatrix } from "./rotateMatrix.mjs";

let dragging = false;
let dragIndex = -1;
let inverseRotateMatrix = inverseMatrix(rotationMatrix());

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
  }
};

export const onEnd = () => {
  dragging = false;
  dragIndex = -1;
};
