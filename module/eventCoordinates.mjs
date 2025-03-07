import { normalize } from "./normalize.mjs";
import { getZoomScale } from "./store.mjs";

export const getEventCoordinates = (event) => {
  const rect = canvas.getBoundingClientRect();
  let clientX = event.touches ? event.touches[0].clientX : event.clientX;
  let clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const zoomScale = getZoomScale();

  let x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  let y = -(((clientY - rect.top) / canvas.clientHeight) * 2 - 1);

  x /= zoomScale;
  y /= zoomScale;

  return normalize([x, y, Math.sqrt(1 - x * x - y * y)]);
};
