const info = document.querySelector(".info");
let messageLock = false;

export const updateInfo = (message, delay = 0) => {
  if (!messageLock) {
    info.textContent = message;
    if (delay > 0) {
      messageLock = true;
      setTimeout(() => {
        messageLock = false;
      }, delay);
    }
  }
};
