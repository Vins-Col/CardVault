import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { CARD_ASPECT_RATIO } from "./geometry";

export interface ProcessedImageResult {
  croppedUri: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  rotation: number;
  crop: { x: number; y: number; width: number; height: number };
}

export async function processCapturedImageUri(
  uri: string,
  width?: number,
  height?: number,
): Promise<ProcessedImageResult> {
  const origWidth = width ?? 1000;
  const origHeight = height ?? 1400;

  let normalizedUri = uri;
  let normWidth = origWidth;
  let normHeight = origHeight;
  let rotation = 0;

  if (origWidth > origHeight) {
    rotation = 90;
    try {
      const rotRes = await ImageManipulator.manipulateAsync(
        uri,
        [{ rotate: 90 }],
        { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG },
      );
      normalizedUri = rotRes.uri;
      normWidth = rotRes.width ?? origHeight;
      normHeight = rotRes.height ?? origWidth;
    } catch {
      normWidth = origHeight;
      normHeight = origWidth;
    }
  }

  console.log(
    `[Image Normalization]\n\nOriginal dimensions:\n${origWidth}x${origHeight}\n\nRotation applied:\n${rotation}\n\nNormalized dimensions:\n${normWidth}x${normHeight}`
  );

  // Overlay-aligned crop matching CardCaptureOverlay (width * 0.78 width, 3.5/2.5 aspect ratio height)
  const desiredFrameWidth = Math.round(normWidth * 0.78);
  const desiredFrameHeight = Math.round(desiredFrameWidth * (3.5 / 2.5));

  let cropWidth = normWidth;
  let cropHeight = normHeight;
  let cropX = 0;
  let cropY = 0;

  if (desiredFrameHeight <= normHeight && desiredFrameWidth <= normWidth) {
    cropWidth = desiredFrameWidth;
    cropHeight = desiredFrameHeight;
    cropX = Math.round((normWidth - cropWidth) / 2);
    cropY = Math.round((normHeight - cropHeight) / 2);
  } else {
    if (normWidth / normHeight > CARD_ASPECT_RATIO) {
      cropHeight = normHeight;
      cropWidth = Math.round(normHeight * CARD_ASPECT_RATIO);
      cropX = Math.round((normWidth - cropWidth) / 2);
    } else {
      cropWidth = normWidth;
      cropHeight = Math.round(normWidth / CARD_ASPECT_RATIO);
      cropY = Math.round((normHeight - cropHeight) / 2);
    }
  }

  let croppedUri = normalizedUri;
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      normalizedUri,
      [
        {
          crop: {
            originX: cropX,
            originY: cropY,
            width: cropWidth,
            height: cropHeight,
          },
        },
      ],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    croppedUri = manipResult.uri;
  } catch {
    croppedUri = normalizedUri;
  }

  console.log(
    `[Crop Alignment]\n\nPreview dimensions:\n${normWidth}x${normHeight}\n\nNormalized source dimensions:\n${normWidth}x${normHeight}\n\nOverlay frame:\n${cropX},${cropY},${cropWidth},${cropHeight}\n\nImage crop:\n${cropX},${cropY},${cropWidth},${cropHeight}\n\nOverlay aspect ratio:\n${CARD_ASPECT_RATIO}\n\nCrop aspect ratio:\n${CARD_ASPECT_RATIO}\n\nOriginal URI:\n${uri}\n\nProcessed URI:\n${croppedUri}`
  );

  return {
    croppedUri,
    width: cropWidth,
    height: cropHeight,
    originalWidth: origWidth,
    originalHeight: origHeight,
    rotation,
    crop: { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
  };
}

export async function pickImageFromGallery(): Promise<ProcessedImageResult | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Permission to access media library is required.");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  const asset = result.assets[0];
  return processCapturedImageUri(asset.uri, asset.width, asset.height);
}

export async function takePhotoWithCamera(): Promise<ProcessedImageResult | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Permission to access camera is required.");
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  return processCapturedImageUri(asset.uri, asset.width, asset.height);
}
