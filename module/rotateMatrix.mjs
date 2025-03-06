import { getRotation } from "./store.mjs";

export const rotationMatrix = () => {
  const [rotationX, rotationY] = getRotation();
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);

  return [
    cosY,
    0,
    sinY,
    0,
    sinX * sinY,
    cosX,
    -sinX * cosY,
    0,
    -cosX * sinY,
    sinX,
    cosX * cosY,
    0,
    0,
    0,
    0,
    1,
  ];
};
