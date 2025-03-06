export const normalize = ([x, y, z]) => {
  const length = Math.sqrt(x * x + y * y + z * z);
  return [x / length, y / length, z / length];
};
