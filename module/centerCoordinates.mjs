import { rotationMatrix } from "./rotateMatrix.mjs";
import { getZoomScale } from "./store.mjs";
import { applyMatrix } from "./matrixUtils.mjs";

export const getScreenCenterWorldCoords = () => {
  const zoomScale = getZoomScale();
  const rotation = rotationMatrix();
  let cameraDirection = [0, 0, -1];

  let [cx, cy, cz] = applyMatrix(cameraDirection, rotation);
  cx *= zoomScale;
  cy *= zoomScale;
  cz *= zoomScale;

  cx = Math.max(-1, Math.min(1, cx));
  cy = Math.max(-1, Math.min(1, cy));
  cz = Math.max(-1, Math.min(1, cz));

  return [cx, cy, cz];
};
