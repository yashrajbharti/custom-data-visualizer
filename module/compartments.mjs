export const getCompartmentIndex = ([x, y, _]) => {
  const latIndex = Math.floor(((y + 1) / 2) * 8);
  const lonIndex = Math.floor(((x + 1) / 2) * 8);
  return latIndex * 8 + lonIndex;
};
