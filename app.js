import { updateInfo } from "./module/info.mjs";
import { normalize } from "./module/normalize.mjs";
import { enableButton, disableButton } from "./module/buttonState.mjs";
import { render } from "./module/render.mjs";
import { loadStoredData } from "./module/loadData.mjs";
import { startDragging, onMove, onEnd } from "./module/interactions.mjs";

const canvas = document.getElementById("canvas");

let points = [];

let history = [];
let redoStack = [];
let focusedIndex = 0;

const undo = () => {
  if (history.length > 0) {
    redoStack.push(JSON.parse(JSON.stringify(points)));
    points = history.pop();
    render(points, focusedIndex);
    updateInfo("Undo action performed");
    enableButton("redo");
  } else disableButton("undo");
};
const redo = () => {
  if (redoStack.length > 0) {
    history.push(JSON.parse(JSON.stringify(points)));
    points = redoStack.pop();
    render(points, focusedIndex);
    updateInfo("Redo action performed");
    enableButton("undo");
  } else disableButton("redo");
};

if (history.length === 0) disableButton("undo");
if (redoStack.length === 0) disableButton("redo");

document.getElementById("undo").addEventListener("click", undo);
document.getElementById("redo").addEventListener("click", redo);
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    if (event.shiftKey) {
      redo();
    } else {
      undo();
    }
    event.preventDefault();
  }
});

window.addEventListener("keydown", (event) => {
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

    let moveAmount = 0.05;
    if (event.key === "ArrowUp") points[focusedIndex][1] += moveAmount;
    if (event.key === "ArrowDown") points[focusedIndex][1] -= moveAmount;
    if (event.key === "ArrowLeft") points[focusedIndex][0] -= moveAmount;
    if (event.key === "ArrowRight") points[focusedIndex][0] += moveAmount;

    points[focusedIndex] = normalize(points[focusedIndex]);
    render(points, focusedIndex);
  }
});

loadStoredData(points, focusedIndex);

canvas.addEventListener(
  "mousedown",
  (e) =>
    ([history, redoStack, focusedIndex] = startDragging(
      e,
      points,
      focusedIndex,
      history,
      redoStack
    ))
);
canvas.addEventListener("mousemove", (e) => onMove(e, points, focusedIndex));
canvas.addEventListener("mouseup", onEnd);
canvas.addEventListener(
  "touchstart",
  (e) =>
    ([history, redoStack, focusedIndex] = startDragging(
      e,
      points,
      focusedIndex,
      history,
      redoStack
    ))
);
canvas.addEventListener("touchmove", (e) => onMove(e, points, focusedIndex));
canvas.addEventListener("touchend", onEnd);
