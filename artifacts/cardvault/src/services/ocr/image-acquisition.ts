import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

export async function pickImageFromGallery(): Promise<string | null> {
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
  return result.assets[0].uri;
}

export async function takePhotoWithCamera(): Promise<string | null> {
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
  const originalWidth = asset.width ?? 1000;
  const originalHeight = asset.height ?? 1400;

  // Pokémon card aspect ratio (width / height = 2.5 / 3.5 ≈ 0.714)
  const targetAspect = 2.5 / 3.5;
  let cropWidth = originalWidth;
  let cropHeight = originalHeight;
  let cropX = 0;
  let cropY = 0;

  if (originalWidth / originalHeight > targetAspect) {
    cropHeight = originalHeight;
    cropWidth = Math.round(originalHeight * targetAspect);
    cropX = Math.round((originalWidth - cropWidth) / 2);
  } else {
    cropWidth = originalWidth;
    cropHeight = Math.round(originalWidth / targetAspect);
    cropY = Math.round((originalHeight - cropHeight) / 2);
  }

  let croppedUri = asset.uri;
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      asset.uri,
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
    croppedUri = asset.uri;
  }

  console.log(
    `[Camera V3] original image size: ${originalWidth}x${originalHeight}, original URI: ${asset.uri}, cropped image size: ${cropWidth}x${cropHeight}, cropped URI: ${croppedUri}`,
  );

  return croppedUri;
}
