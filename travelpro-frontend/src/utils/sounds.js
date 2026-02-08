const HOVER_SFX =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAeAAACABJbXRuAAABkAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABOAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABOAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABOAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABOAAAACAAAB9PAAAA";

const POPUP_SFX =
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAeAAACABJbXRuAAABkAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABQAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABQAAAACAAAB9PAAACcQCAeAAACABNZWFuAAABQAAAACAAAB9PAAAA";

const assetHoverSrc = new URL("../assets/hover.mp3", import.meta.url).href;
const assetPopupSrc = new URL("../assets/notify.mp3", import.meta.url).href;

let externalSources = {
  hover: assetHoverSrc,
  popup: assetPopupSrc,
};

export const setSoundSources = ({ hover = "", popup = "" } = {}) => {
  externalSources = { hover, popup };
};

const canPlaySound = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) {
      return false;
    }
  } catch {
    return true;
  }
  return true;
};

const play = (src, volume, fallbackSrc) => {
  try {
    if (!canPlaySound()) return;
    const audio = new Audio(src);
    audio.volume = volume;
    audio.addEventListener("error", () => {
      if (fallbackSrc && fallbackSrc !== src) {
        try {
          const fallbackAudio = new Audio(fallbackSrc);
          fallbackAudio.volume = volume;
          fallbackAudio.play().catch(() => {});
        } catch {
          // ignore fallback errors
        }
      }
    });
    audio.play().catch(() => {});
  } catch {
    // ignore audio errors
  }
};

let lastHoverAt = 0;
export const playHoverSound = () => {
  const now = Date.now();
  if (now - lastHoverAt < 350) return;
  lastHoverAt = now;
  const src = externalSources.hover || assetHoverSrc;
  play(src, 0.2, HOVER_SFX);
};
export const playNotificationSound = () => {
  const src = externalSources.popup || assetPopupSrc;
  play(src, 0.5, POPUP_SFX);
};
