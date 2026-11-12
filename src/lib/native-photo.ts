"use client";

import { compressImageFile } from "@/lib/image";

export type PhotoPickResult = {
  dataUrl: string;
  source: "native" | "web";
};

async function dataUrlFromNativePath(path: string): Promise<string> {
  const res = await fetch(path);
  const blob = await res.blob();
  const file = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
  return compressImageFile(file);
}

/**
 * 아이폰 네이티브(Capacitor)에서는 시스템 사진/카메라 권한 팝업을 띄우고,
 * 웹/PWA에서는 파일 선택기를 사용합니다.
 */
export async function pickPhotoForNanal(
  fallbackInput?: HTMLInputElement | null,
): Promise<PhotoPickResult | null> {
  try {
    const core = await import("@capacitor/core");
    if (core.Capacitor.isNativePlatform()) {
      const { Camera, CameraResultType, CameraSource } = await import(
        "@capacitor/camera"
      );
      const permission = await Camera.requestPermissions({
        permissions: ["camera", "photos"],
      });
      const photosOk =
        permission.photos === "granted" || permission.photos === "limited";
      const cameraOk = permission.camera === "granted";
      if (!photosOk && !cameraOk) {
        throw new Error("photo_permission_denied");
      }

      const photo = await Camera.getPhoto({
        quality: 82,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: "사진 추가",
        promptLabelPhoto: "보관함에서 선택",
        promptLabelPicture: "카메라로 촬영",
        promptLabelCancel: "취소",
      });

      if (photo.dataUrl?.startsWith("data:image/")) {
        return { dataUrl: photo.dataUrl, source: "native" };
      }
      if (photo.webPath) {
        return {
          dataUrl: await dataUrlFromNativePath(photo.webPath),
          source: "native",
        };
      }
      return null;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "photo_permission_denied"
    ) {
      throw error;
    }
    // Capacitor 미탑재/웹 환경이면 파일 input 으로 폴백
  }

  if (fallbackInput) {
    fallbackInput.click();
    return null;
  }
  return null;
}
