import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

// Slugify
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

export const deleteImages = async (images: string[]) => {
  try {
    // Delete images from cloudinary
    await cloudinary.api.delete_resources(images);
  } catch (err) {
    console.log("Error deleting images:", err);
  }
};

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "salem",
  public_id: string
) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
