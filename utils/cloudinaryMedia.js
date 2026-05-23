import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const allowedVideoTypes = new Set([
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
]);

export function toFileArray(files) {
  if (!files) return [];
  return Array.isArray(files) ? files : [files];
}

export function safeUnlinkTemp(file) {
  if (!file?.tempFilePath || !fs.existsSync(file.tempFilePath)) return;

  try {
    fs.unlinkSync(file.tempFilePath);
  } catch {
    /* ignore */
  }
}

function getResourceType(file) {
  if (allowedImageTypes.has(file.mimetype)) return "image";
  if (allowedVideoTypes.has(file.mimetype)) return "video";
  return null;
}

export async function uploadProductMedia(files) {
  const mediaFiles = toFileArray(files);
  const uploadedMedia = [];

  try {
    for (const file of mediaFiles) {
      const resourceType = getResourceType(file);

      if (!resourceType) {
        safeUnlinkTemp(file);
        const error = new Error("Invalid file type. Use JPEG, PNG, WebP, MP4, MOV, MPEG, or WebM");
        error.statusCode = 400;
        throw error;
      }

      try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: resourceType === "video" ? "products_videos" : "products_images",
          resource_type: resourceType,
        });

        uploadedMedia.push({
          public_id: result.public_id,
          url: result.secure_url,
          resource_type: resourceType,
        });
      } finally {
        safeUnlinkTemp(file);
      }
    }
  } catch (error) {
    await destroyCloudinaryMedia(uploadedMedia);
    throw error;
  }

  return uploadedMedia;
}

export async function destroyCloudinaryMedia(media) {
  const mediaItems = toFileArray(media).filter(Boolean);

  for (const item of mediaItems) {
    const publicId = typeof item === "string" ? item : item.public_id;
    if (!publicId) continue;

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: item.resource_type || "image",
      });
    } catch {
      /* ignore */
    }
  }
}
