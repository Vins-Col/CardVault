export const CARD_ASPECT_RATIO = 2.5 / 3.5; // width / height

export function getOverlayFrame(containerWidth: number, containerHeight: number) {
  const frameWidth = Math.min(containerWidth * 0.78, 290);
  const frameHeight = frameWidth * (3.5 / 2.5);
  const x = containerWidth > 0 ? (containerWidth - frameWidth) / 2 : 0;
  const y = containerHeight > 0 ? (containerHeight - frameHeight) / 2 : 0;
  return { x, y, width: frameWidth, height: frameHeight };
}

export function logCropAlignment(isLandscape: boolean) {
  console.log(
    `[Crop Alignment]\nOverlay aspect ratio:\n${CARD_ASPECT_RATIO}\nCrop aspect ratio:\n${CARD_ASPECT_RATIO}\nOrientation:\n${isLandscape ? "landscape" : "portrait"}`
  );
}
