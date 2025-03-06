import { getRotation } from "./store.mjs";

export const rotationMatrix = () => {
  const [rotationX, rotationY] = getRotation();
  const cosX = Math.cos(rotationX) || 0;
  const sinX = Math.sin(rotationX) || 0;
  const cosY = Math.cos(rotationY) || 0;
  const sinY = Math.sin(rotationY) || 0;

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
