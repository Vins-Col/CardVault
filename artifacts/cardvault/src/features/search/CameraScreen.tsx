import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import CardCaptureOverlay from "@/src/components/CardCaptureOverlay";
import { pickImageFromGallery } from "@/src/services/ocr/image-acquisition";
import * as ImageManipulator from "expo-image-manipulator";

interface CameraScreenProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (croppedUri: string) => void;
}

export default function CameraScreen({
  visible,
  onClose,
  onCapture,
}: CameraScreenProps) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!visible) {
    return null;
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <Feather name="camera-off" size={64} color={colors.mutedForeground} />
          <Text style={[styles.permissionText, { color: colors.foreground }]}>
            Camera permission is required to scan cards.
          </Text>
          <Pressable
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={() => void requestPermission()}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelButtonText, { color: colors.mutedForeground }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const processAndCropImage = async (uri: string, width?: number, height?: number) => {
    const origWidth = width ?? 1000;
    const origHeight = height ?? 1400;
    const targetAspect = 2.5 / 3.5;
    let cropWidth = origWidth;
    let cropHeight = origHeight;
    let cropX = 0;
    let cropY = 0;

    if (origWidth / origHeight > targetAspect) {
      cropHeight = origHeight;
      cropWidth = Math.round(origHeight * targetAspect);
      cropX = Math.round((origWidth - cropWidth) / 2);
    } else {
      cropWidth = origWidth;
      cropHeight = Math.round(origWidth / targetAspect);
      cropY = Math.round((origHeight - cropHeight) / 2);
    }

    let croppedUri = uri;
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
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
      croppedUri = uri;
    }

    console.log(
      `[Camera V3] original image size: ${origWidth}x${origHeight}, original URI: ${uri}, cropped image size: ${cropWidth}x${cropHeight}, cropped URI: ${croppedUri}`,
    );

    return croppedUri;
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo.");
      }
      const croppedUri = await processAndCropImage(
        photo.uri,
        photo.width,
        photo.height,
      );
      onCapture(croppedUri);
    } catch (e) {
      Alert.alert(
        "Camera Error",
        e instanceof Error ? e.message : "Could not take photo.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGalleryImport = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const uri = await pickImageFromGallery();
      if (uri) {
        const croppedUri = await processAndCropImage(uri, 1000, 1400);
        onCapture(croppedUri);
      }
    } catch (e) {
      Alert.alert(
        "Gallery Error",
        e instanceof Error ? e.message : "Could not pick image.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView style={styles.camera} ref={cameraRef}>
          <CardCaptureOverlay visible={true} />

          {/* Top Header Controls */}
          <View style={styles.topBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close camera"
              style={styles.iconButton}
              onPress={onClose}
            >
              <Feather name="x" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Bottom Action Controls */}
          <View style={styles.bottomBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose from gallery"
              style={styles.actionButton}
              onPress={() => void handleGalleryImport()}
            >
              <Feather name="image" size={24} color="#FFFFFF" />
              <Text style={styles.actionLabel}>Gallery</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Capture card photo"
              style={[
                styles.captureButton,
                { borderColor: colors.primary },
              ]}
              onPress={() => void handleCapturePhoto()}
              disabled={isProcessing}
            >
              <View
                style={[
                  styles.captureButtonInner,
                  { backgroundColor: colors.primary },
                ]}
              />
            </Pressable>

            <View style={styles.spacerButton} />
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  spacerButton: {
    width: 60,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    fontSize: 16,
  },
});
