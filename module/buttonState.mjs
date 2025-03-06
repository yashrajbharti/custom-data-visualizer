export const enableButton = (_button) => {
  const button = document.getElementById(_button);
  button.removeAttribute("disabled");
};
export const disableButton = (_button) => {
  const button = document.getElementById(_button);
  button.setAttribute("disabled", "true");
};
