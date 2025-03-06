import { normalize } from "./normalize.mjs";

export const getEventCoordinates = (event) => {
  const rect = canvas.getBoundingClientRect();
  let clientX = event.touches ? event.touches[0].clientX : event.clientX;
  let clientY = event.touches ? event.touches[0].clientY : event.clientY;

  const x = ((clientX - rect.left) / canvas.clientWidth) * 2 - 1;
  const y = -(((clientY - rect.top) / canvas.clientHeight) * 2 - 1);

  return normalize([x, y, Math.sqrt(1 - x * x - y * y)]);
};
