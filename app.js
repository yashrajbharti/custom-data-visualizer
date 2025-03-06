import { normalize } from "./module/normalize.mjs";
import { enableButton, disableButton } from "./module/buttonState.mjs";
import { render } from "./module/render.mjs";
import { loadStoredData } from "./module/loadData.mjs";
import {
  startDragging,
  onMove,
  onEnd,
  burstNestedDotByOneLevel,
  attemptNesting,
} from "./module/interactions.mjs";
import { undo, redo } from "./module/history.mjs";
import { setRotation, setZoomScale } from "./module/store.mjs";
import { updateInfo } from "./module/info.mjs";

const canvas = document.getElementById("canvas");

let points = [];
let history = [];
let redoStack = [];
let focusedIndex = 0;
let zoomScale = 1.0;
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 3.0;
let [rotationX, rotationY] = [0, 0];
let rotationSpeed = 0.02;
let isRotating = false;
let lastX, lastY;
let lastTap = 0;

const handleUndoRedo = (isRedo) => {
  [points, history, redoStack] = isRedo
    ? redo(points, focusedIndex, history, redoStack)
    : undo(points, focusedIndex, history, redoStack);
};

const handleKeyboardEvents = (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    focusedIndex =
      (focusedIndex + (event.shiftKey ? -1 : 1) + points.length) %
      points.length;
    render(points, focusedIndex);
    return;
  }

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    if (event.shiftKey) {
      isRotating = true;
      switch (event.key) {
        case "ArrowUp":
          rotationX = Math.max(rotationX - rotationSpeed, -Math.PI / 2);
          break;
        case "ArrowDown":
          rotationX = Math.min(rotationX + rotationSpeed, Math.PI / 2);
          break;
        case "ArrowLeft":
          rotationY -= rotationSpeed;
          break;
        case "ArrowRight":
          rotationY += rotationSpeed;
          break;
      }
      updateInfo(`Rotating ${rotationX?.toFixed(2)} ${rotationY?.toFixed(2)}`);
      setRotation(rotationX, rotationY);
      render(points, focusedIndex, isRotating);
    } else {
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
      return;
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    handleUndoRedo(event.shiftKey);
    event.preventDefault();
  }
};

const handleStartDragging = (event) => {
  if (!event.shiftKey) {
    [history, redoStack, focusedIndex] = startDragging(
      event,
      points,
      focusedIndex,
      history,
      redoStack
    );
  }
};

const handleRotation = (event) => {
  if (!isRotating) return;
  const dx = (event.clientX - lastX) * rotationSpeed;
  const dy = (event.clientY - lastY) * rotationSpeed;
  rotationX = Math.max(rotationX - dy, -Math.PI / 2);
  rotationY += dx;
  lastX = event.clientX;
  lastY = event.clientY;
  updateInfo(`Rotating ${rotationX?.toFixed(2)} ${rotationY?.toFixed(2)}`);
  setRotation(rotationX, rotationY);
  render(points, focusedIndex, isRotating);
};

const handleTouchRotation = (event) => {
  if (event.touches.length !== 2) return;
  isRotating = true;
  event.preventDefault();
  const dx = (event.touches[0].clientX - lastX) * rotationSpeed;
  const dy = (event.touches[0].clientY - lastY) * rotationSpeed;
  rotationX = Math.max(rotationX - dy, -Math.PI / 2);
  rotationY += dx;
  lastX = event.touches[0].clientX;
  lastY = event.touches[0].clientY;
  updateInfo(`Rotating ${rotationX?.toFixed(2)} ${rotationY?.toFixed(2)}`);
  setRotation(rotationX, rotationY);
  render(points, focusedIndex, isRotating);
};

const setupEventListeners = () => {
  canvas.addEventListener("mousedown", handleStartDragging);
  canvas.addEventListener("mousemove", (e) => {
    const dataPoints = onMove(e, points, focusedIndex);
    if (dataPoints) points = dataPoints;
  });
  canvas.addEventListener("mouseup", onEnd);
  canvas.addEventListener("touchstart", handleStartDragging);
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 2) {
      const dataPoints = onMove(e, points, focusedIndex);
      if (dataPoints) points = dataPoints;
    }
  });
  canvas.addEventListener("touchend", () => {
    onEnd();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      const dataPoints = burstNestedDotByOneLevel(points, focusedIndex);
      if (dataPoints) points = dataPoints;
    }
    lastTap = currentTime;
  });

  document
    .getElementById("undo")
    .addEventListener("click", () => handleUndoRedo(false));
  document
    .getElementById("redo")
    .addEventListener("click", () => handleUndoRedo(true));
  document.addEventListener("keydown", handleKeyboardEvents);

  document.getElementById("zoom-in").addEventListener("click", () => {
    zoomScale = Math.min(zoomScale + zoomStep, maxZoom);
    setZoomScale(zoomScale);
    render(points, focusedIndex);
    updateInfo("Zooming in");
  });

  document.getElementById("zoom-out").addEventListener("click", () => {
    zoomScale = Math.max(zoomScale - zoomStep, minZoom);
    setZoomScale(zoomScale);
    render(points, focusedIndex);
    updateInfo("Zooming out");
  });

  canvas.addEventListener("mousedown", (event) => {
    if (event.shiftKey) {
      isRotating = true;
      lastX = event.clientX;
      lastY = event.clientY;
    }
  });

  canvas.addEventListener("mousemove", handleRotation);
  canvas.addEventListener("mouseup", () => (isRotating = false));
  canvas.addEventListener("mouseleave", () => (isRotating = false));

  canvas.addEventListener("touchstart", (event) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      lastX = event.touches[0].clientX;
      lastY = event.touches[0].clientY;
    }
  });
  canvas.addEventListener("touchmove", handleTouchRotation);
  canvas.addEventListener("dblclick", () => {
    const dataPoints = burstNestedDotByOneLevel(points, focusedIndex);
    if (dataPoints) points = dataPoints;
  });
};

loadStoredData(points, focusedIndex);
setupEventListeners();
if (history.length === 0) disableButton("undo");
if (redoStack.length === 0) disableButton("redo");

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "m") {
    event.preventDefault();
    const dataPoints = attemptNesting(points, focusedIndex);
    if (dataPoints) points = dataPoints;
  } else if (event.ctrlKey && event.shiftKey && event.key === "M") {
    event.preventDefault();
    const dataPoints = burstNestedDotByOneLevel(points, focusedIndex);
    if (dataPoints) points = dataPoints;
  }
});
