export const getCompartmentIndex = ([x, y, _]) => {
  const latIndex = Math.min(7, Math.max(0, Math.floor(((y + 1) / 2) * 8)));
  const lonIndex = Math.min(7, Math.max(0, Math.floor(((x + 1) / 2) * 8)));

  const compartmentIndex = latIndex * 8 + lonIndex;

  return compartmentIndex;
};
