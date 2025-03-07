export const setZoomScale = (value) => {
  localStorage.setItem("zoom", value.toString());
};
export const getZoomScale = () => {
  return +localStorage.getItem("zoom") || 1;
};

export const setRotation = (x, y) => {
  localStorage.setItem("rotate", [x, y].toString());
};
export const getRotation = () => {
  return (
    localStorage
      .getItem("rotate")
      ?.split(",")
      ?.map((val) => +val) ?? [0, 0]
  );
};
