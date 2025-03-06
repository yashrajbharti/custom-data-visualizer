export const convertToSphereCoords = (x, y) => {
  const lat = y * Math.PI;
  const lng = x * 2 * Math.PI;
  return [
    Math.cos(lat) * Math.cos(lng),
    Math.sin(lat),
    Math.cos(lat) * Math.sin(lng),
  ];
};
