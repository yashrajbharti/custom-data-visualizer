export const getNestingDepth = (point) => {
  if (!point.children || point.children.length === 0) {
    return 0;
  }
  return 1 + Math.max(...point.children.map(getNestingDepth));
};
