import { normalize } from "./module/normalize.mjs";
import { enableButton, disableButton } from "./module/buttonState.mjs";
import { render } from "./module/render.mjs";
import { loadStoredData } from "./module/loadData.mjs";
import { startDragging, onMove, onEnd } from "./module/interactions.mjs";
import { undo, redo } from "./module/history.mjs";

const canvas = document.getElementById("canvas");

let points = [];
let history = [];
let redoStack = [];
let focusedIndex = 0;

function handleUndoRedo(isRedo) {
  if (isRedo) {
    [points, history, redoStack] = redo(
      points,
      focusedIndex,
      history,
      redoStack
    );
  } else {
    [points, history, redoStack] = undo(
      points,
      focusedIndex,
      history,
      redoStack
    );
  }
}

function handleKeyboardEvents(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    focusedIndex =
      (focusedIndex + (event.shiftKey ? -1 : 1) + points.length) %
      points.length;
    render(points, focusedIndex);
  } else if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    event.preventDefault();
    history.push(JSON.parse(JSON.stringify(points)));
    redoStack = [];
    enableButton("undo");
    disableButton("redo");

    const moveAmount = 0.05;
    if (event.key === "ArrowUp") points[focusedIndex][1] += moveAmount;
    if (event.key === "ArrowDown") points[focusedIndex][1] -= moveAmount;
    if (event.key === "ArrowLeft") points[focusedIndex][0] -= moveAmount;
    if (event.key === "ArrowRight") points[focusedIndex][0] += moveAmount;

    points[focusedIndex] = normalize(points[focusedIndex]);
    render(points, focusedIndex);
  } else if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    handleUndoRedo(event.shiftKey);
    event.preventDefault();
  }
}

function setupEventListeners() {
  canvas.addEventListener("mousedown", handleStartDragging);
  canvas.addEventListener("mousemove", (e) => onMove(e, points, focusedIndex));
  canvas.addEventListener("mouseup", onEnd);
  canvas.addEventListener("touchstart", handleStartDragging);
  canvas.addEventListener("touchmove", (e) => onMove(e, points, focusedIndex));
  canvas.addEventListener("touchend", onEnd);

  document
    .getElementById("undo")
    .addEventListener("click", () => handleUndoRedo(false));
  document
    .getElementById("redo")
    .addEventListener("click", () => handleUndoRedo(true));
  document.addEventListener("keydown", handleKeyboardEvents);
}

function handleStartDragging(event) {
  [history, redoStack, focusedIndex] = startDragging(
    event,
    points,
    focusedIndex,
    history,
    redoStack
  );
}

loadStoredData(points, focusedIndex);
setupEventListeners();

if (history.length === 0) disableButton("undo");
if (redoStack.length === 0) disableButton("redo");
