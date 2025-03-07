import { vertexShaderSource, fragmentShaderSource } from "./shaders.mjs";
import { createShader } from "./createShader.mjs";
import { updateInfo } from "./info.mjs";
import { resizeCanvas } from "./resize.mjs";
import { getZoomScale } from "./store.mjs";
import { rotationMatrix } from "./rotateMatrix.mjs";
import { multiplyMatrices } from "./matrixUtils.mjs";

const canvas = document.getElementById("canvas");
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
const gl = canvas.getContext("webgl2");
if (!gl) {
  console.error("WebGL2 not supported");
}

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
const focusedIndexLocation = gl.getUniformLocation(program, "u_focusedIndex");

gl.uniform1i(focusedIndexLocation, -1);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

const matrixLocation = gl.getUniformLocation(program, "u_matrix");

export const render = (points, focusedIndex, customAction = false) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  const flatPoints = new Float32Array(points.flat());
  const zoomScale = getZoomScale() || 1;
  gl.bufferData(gl.ARRAY_BUFFER, flatPoints, gl.DYNAMIC_DRAW);

  const viewMatrix = [
    zoomScale,
    0,
    0,
    0,
    0,
    zoomScale,
    0,
    0,
    0,
    0,
    0.1,
    0,
    0,
    0,
    0,
    1,
  ];
  const rotateMatrix = rotationMatrix();

  gl.uniformMatrix4fv(
    matrixLocation,
    false,
    multiplyMatrices(viewMatrix, rotateMatrix)
  );

  for (let i = 0; i < points.length; i++) {
    gl.uniform1i(focusedIndexLocation, focusedIndex === i);
    gl.drawArrays(gl.POINTS, i, 1);
  }

  if (points.length && !customAction)
    updateInfo(
      `Focused point index: ${focusedIndex}, moved to ${points[
        focusedIndex
      ][0]?.toFixed(2)}, ${points[focusedIndex][1]?.toFixed(2)}, ${points[
        focusedIndex
      ][2]?.toFixed(2)}`
    );
};

gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);
