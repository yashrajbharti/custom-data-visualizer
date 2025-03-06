import { getEventCoordinates } from "./eventCoordinates.mjs";
import { render } from "./render.mjs";
import { enableButton, disableButton } from "./buttonState.mjs";

let dragging = false;
let dragIndex = -1;

export const startDragging = (
  event,
  points,
  focusedIndex,
  history,
  redoStack
) => {
  const [x, y, z] = getEventCoordinates(event);
  dragIndex = points.findIndex(
    (p) => Math.hypot(p[0] - x, p[1] - y, p[2] - z) < 0.05
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
    if (!isNaN(x) && !isNaN(y)) points[dragIndex] = [x, y, z];
    render(points, focusedIndex);
  }
};

export const onEnd = () => {
  dragging = false;
  dragIndex = -1;
};
