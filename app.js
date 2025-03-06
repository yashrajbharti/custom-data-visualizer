import { vertexShaderSource, fragmentShaderSource } from "./module/shaders.mjs";
import { updateInfo } from "./module/info.mjs";
import { resizeCanvas } from "./module/resize.mjs";
import { createShader } from "./module/createShader.mjs";
import { convertToSphereCoords } from "./module/sphere.mjs";
import { normalize } from "./module/normalize.mjs";
import { getEventCoordinates } from "./module/eventCoordinates.mjs";
import { enableButton, disableButton } from "./module/buttonState.mjs";

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");
if (!gl) {
  console.error("WebGL2 not supported");
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

let points = [];
const BATCH_SIZE = 5000;
let loadedCount = 0;

const loadStoredData = () => {
  const dbRequest = indexedDB.open("largeDataDB", 1);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("data", "readonly");
    const store = transaction.objectStore("data");
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor && loadedCount < BATCH_SIZE) {
        points.push(convertToSphereCoords(cursor.value.x, cursor.value.y));
        loadedCount++;
        cursor.continue();
      } else {
        // console.log(`Loaded ${points.length} points`);
        render();
      }
    };
  };
};

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

const matrixLocation = gl.getUniformLocation(program, "u_matrix");

const focusedIndexLocation = gl.getUniformLocation(program, "u_focusedIndex");
gl.uniform1i(focusedIndexLocation, -1);

let history = [];
let redoStack = [];
let focusedIndex = 0;
let dragging = false;
let dragIndex = -1;

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const flatPoints = new Float32Array(points.flat());
  gl.bufferData(gl.ARRAY_BUFFER, flatPoints, gl.DYNAMIC_DRAW);

  const rotationMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  gl.uniformMatrix4fv(matrixLocation, false, rotationMatrix);

  for (let i = 0; i < points.length; i++) {
    gl.uniform1i(focusedIndexLocation, focusedIndex === i);
    gl.drawArrays(gl.POINTS, i, 1);
  }

  if (points.length)
    updateInfo(
      `Focused point index: ${focusedIndex}, moved to ${points[
        focusedIndex
      ][0]?.toFixed(2)}, ${points[focusedIndex][1]?.toFixed(2)}`
    );
};

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);

const undo = () => {
  if (history.length > 0) {
    redoStack.push(JSON.parse(JSON.stringify(points)));
    points = history.pop();
    render();
    updateInfo("Undo action performed");
    enableButton("redo");
  } else disableButton("undo");
};
const redo = () => {
  if (redoStack.length > 0) {
    history.push(JSON.parse(JSON.stringify(points)));
    points = redoStack.pop();
    render();
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
    render();
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
    render();
  }
});

const startDragging = (event) => {
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
};

const onMove = (event) => {
  if (dragging && dragIndex !== -1) {
    const [x, y, z] = getEventCoordinates(event);
    if (!isNaN(x) && !isNaN(y)) points[dragIndex] = [x, y, z];
    render();
  }
};

const onEnd = () => {
  dragging = false;
  dragIndex = -1;
};

canvas.addEventListener("mousedown", startDragging);
canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("mouseup", onEnd);
canvas.addEventListener("touchstart", startDragging);
canvas.addEventListener("touchmove", onMove);
canvas.addEventListener("touchend", onEnd);

loadStoredData();
