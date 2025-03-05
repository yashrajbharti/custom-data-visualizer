// WebGL2 MVP
// Later to be upgraded with a 3D Earth model

const canvas = document.getElementById("canvas");
const info = document.querySelector(".info");
const gl = canvas.getContext("webgl2");
if (!gl) {
  console.error("WebGL2 not supported");
}

const updateInfo = (text) => {
  info.textContent = text;
};

const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  gl.viewport(0, 0, canvas.width, canvas.height);
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const vertexShaderSource = `#version 300 es
layout(location = 0) in vec2 a_position;
void main() {
    gl_PointSize = 5.0;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 outColor;
uniform int u_focusedIndex;
uniform int u_index;
void main() {
    if (u_focusedIndex == u_index) {
        outColor = vec4(0.0, 0.5, 0.0, 1.0);
    } else {
        outColor = vec4(1.0, 1, 0.0, 1.0);
    }
}`;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

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

let points = [
  { x: -0.5, y: -0.5 },
  { x: 0.5, y: -0.5 },
  { x: 0.5, y: 0.5 },
  { x: -0.5, y: 0.5 },
];

const loadStoredData = () => {
  const dbRequest = indexedDB.open("largeDataDB", 1);

  dbRequest.onsuccess = function (event) {
    const db = event.target.result;
    const transaction = db.transaction("data", "readonly");
    const store = transaction.objectStore("data");
    const getRequest = store.getAll();

    getRequest.onsuccess = function () {
      if (getRequest.result.length > 0) {
        points = getRequest.result; // Assign the retrieved points
        console.log("Loaded points from IndexedDB:", points);
        render(); // Ensure rendering updates after loading data
      } else {
        console.warn("No points found in IndexedDB.");
      }
    };

    getRequest.onerror = function () {
      console.error("Error retrieving data from IndexedDB.");
    };
  };

  dbRequest.onerror = function () {
    console.error("Failed to open IndexedDB.");
  };
};

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const focusedIndexLocation = gl.getUniformLocation(program, "u_focusedIndex");
gl.uniform1i(focusedIndexLocation, -1);

let history = [];
let redoStack = [];
let focusedIndex = 0;
let dragging = false;
let dragIndex = -1;

const render = () => {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  points.forEach((p, index) => {
    gl.uniform1i(focusedIndexLocation, index === focusedIndex ? 1 : 0);
    const flatPoints = new Float32Array([p.x, p.y]);
    gl.bufferData(gl.ARRAY_BUFFER, flatPoints, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, 1);
  });
  updateInfo(
    `Focused point index: ${focusedIndex}, moved to ${points[
      focusedIndex
    ].x.toFixed(2)}, ${points[focusedIndex].y.toFixed(2)}`
  );
};
render();

const getEventCoordinates = (event) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  let clientX, clientY;
  if (event.touches) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }
  const x = ((clientX - rect.left) / (canvas.width / dpr)) * 2 - 1;
  const y = -(((clientY - rect.top) / (canvas.height / dpr)) * 2 - 1);
  return { x, y };
};

const enableButton = (_button) => {
  const button = document.getElementById(_button);
  button.removeAttribute("disabled");
};
const disableButton = (_button) => {
  const button = document.getElementById(_button);
  button.setAttribute("disabled", "true");
};
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
    if (event.key === "ArrowUp") points[focusedIndex].y += moveAmount;
    if (event.key === "ArrowDown") points[focusedIndex].y -= moveAmount;
    if (event.key === "ArrowLeft") points[focusedIndex].x -= moveAmount;
    if (event.key === "ArrowRight") points[focusedIndex].x += moveAmount;
    render();
  }
});

const startDragging = (event) => {
  const { x, y } = getEventCoordinates(event);
  dragIndex = points.findIndex((p) => Math.hypot(p.x - x, p.y - y) < 0.05);
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
    const { x, y } = getEventCoordinates(event);
    points[dragIndex] = { x, y };
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
