import { updateInfo } from "./info.mjs";
import { enableButton, disableButton } from "./buttonState.mjs";
import { render } from "./render.mjs";

export const undo = (points, focusedIndex, history, redoStack) => {
  if (history.length > 0) {
    redoStack.push(JSON.parse(JSON.stringify(points)));
    points = history.pop();
    render(points, focusedIndex);
    updateInfo("Undo action performed");
    enableButton("redo");
  } else disableButton("undo");
  return [points, history, redoStack];
};
export const redo = (points, focusedIndex, history, redoStack) => {
  if (redoStack.length > 0) {
    history.push(JSON.parse(JSON.stringify(points)));
    points = redoStack.pop();
    render(points, focusedIndex);
    updateInfo("Redo action performed");
    enableButton("undo");
  } else disableButton("redo");
  return [points, history, redoStack];
};
