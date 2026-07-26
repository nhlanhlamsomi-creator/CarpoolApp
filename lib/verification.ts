// ─────────────────────────────────────────────────────────────────────────────
// Verification: picking, uploading and submitting identity documents.
//
// Documents are personal information under POPIA, so they go into a PRIVATE
// Supabase bucket. Nothing here ever produces a public URL — reads go through
// short-lived signed URLs instead.
//
// Requires:  npx expo install expo-image-picker
//            npm i base64-arraybuffer
// ─────────────────────────────────────────────────────────────────────────────

import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";

import { fetchAPI } from "@/lib/fetch";
import { getSupabaseClient } from "@/lib/supabase";

export const BUCKET = "verification-documents";

export type DocKind = "id_front" | "id_back" | "selfie";

export type VerificationStatus =
  | "not_submitted"
  | "pending"
  | "approved"
  | "rejected";

export type PickedImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

/** Human labels, kept in one place so the screen and any emails agree. */
export const DOC_LABELS: Record<DocKind, { title: string; help: string }> = {
  id_front: {
    title: "ID document",
    help: "The front of your SA ID card, or the photo page of your passport.",
  },
  id_back: {
    title: "Back of ID",
    help: "The reverse of your ID card. Skip this if you uploaded a passport.",
  },
  selfie: {
    title: "Selfie",
    help: "A clear photo of your face in good light, no hat or sunglasses.",
  },
};

// ─── Picking ─────────────────────────────────────────────────────────────────

async function toPickedImage(
  result: ImagePicker.ImagePickerResult,
): Promise<PickedImage | null> {
  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  if (!asset.base64) return null;

  return {
    uri: asset.uri,
    base64: asset.base64,
    mimeType: asset.mimeType ?? "image/jpeg",
  };
}

/** Choose a document image from the photo library. */
export async function pickFromLibrary(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      "Photo access is off. Turn it on in Settings to upload your document.",
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"], // MediaTypeOptions is deprecated in SDK 52+
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  return toPickedImage(result);
}

/** Take a photo. Pass front: true for the selfie step. */
export async function captureImage(front = false): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      "Camera access is off. Turn it on in Settings to take your photo.",
    );
  }

  const result = await ImagePicker.launchCameraAsync({
    cameraType: front
      ? ImagePicker.CameraType.front
      : ImagePicker.CameraType.back,
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  return toPickedImage(result);
}

// ─── Uploading ───────────────────────────────────────────────────────────────

/**
 * Upload one document and return its storage path (not a URL).
 * Paths are namespaced per user so a storage policy can restrict access.
 */
export async function uploadDocument(
  clerkId: string,
  kind: DocKind,
  image: PickedImage,
): Promise<string> {
  const supabase = getSupabaseClient();

  const extension = image.mimeType.includes("png") ? "png" : "jpg";
  const path = `${clerkId}/${kind}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(image.base64), {
      contentType: image.mimeType,
      upsert: false,
    });

  if (error) {
    console.error("Document upload failed:", error);
    throw new Error("We couldn't upload that image. Check your connection and try again.");
  }

  return path;
}

/**
 * Short-lived read URL for a stored document. Never store the result — it
 * expires, and caching it defeats the point of a private bucket.
 */
export async function getSignedUrl(
  path: string,
  expiresInSeconds = 60,
): Promise<string | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.warn("Could not sign document URL:", error);
    return null;
  }

  return data?.signedUrl ?? null;
}

// ─── Submitting ──────────────────────────────────────────────────────────────

export type VerificationPayload = {
  government_id_url?: string;
  government_id_back_url?: string;
  selfie_image_url?: string;
  /** Derived from the ID number itself, so it can't disagree with the document. */
  id_number?: string;
  date_of_birth?: string;
  id_citizenship?: string;
  /** Anything the automatic checks flagged, for the reviewer to look at. */
  verification_warnings?: string[];
};

/**
 * Save the uploaded paths and move the account into review.
 * Uses the existing /(api)/profile endpoint — no new backend needed beyond
 * accepting these columns.
 */
export async function submitForReview(
  clerkId: string,
  paths: VerificationPayload,
) {
  return fetchAPI("/(api)/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkId,
      ...paths,
      verification_status: "pending",
      verification_submitted_at: new Date().toISOString(),
    }),
  });
}

// ─── Avatars ─────────────────────────────────────────────────────────────────
// Profile photos are shown to drivers and other riders, so unlike ID documents
// these live in a PUBLIC bucket called `avatars`.

export async function uploadAvatar(
  clerkId: string,
  image: PickedImage,
): Promise<string> {
  const supabase = getSupabaseClient();

  const extension = image.mimeType.includes("png") ? "png" : "jpg";
  const path = `${clerkId}/avatar-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, decode(image.base64), {
      contentType: image.mimeType,
      upsert: true,
    });

  if (error) {
    console.error("Avatar upload failed:", error);
    throw new Error("We couldn't upload that photo. Please try again.");
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

// ─── Progress ────────────────────────────────────────────────────────────────

/** Percentage complete, counting each requirement independently. */
export function verificationProgress(flags: {
  photo: boolean;
  phone: boolean;
  id: boolean;
  selfie: boolean;
}) {
  const done = Object.values(flags).filter(Boolean).length;
  return Math.round((done / 4) * 100);
}