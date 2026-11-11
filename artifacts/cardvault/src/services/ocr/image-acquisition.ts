import * as ImagePicker from "expo-image-picker";

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
  return result.assets[0].uri;
}
