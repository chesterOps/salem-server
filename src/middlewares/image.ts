import { Response, Request, NextFunction } from "express";
import { uploadToCloudinary } from "../utils/helpers";

export const uploadImages = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Images array
  let images: string[] = [];
  let public_ids: string[] = [];

  // Check for image files
  if (Array.isArray(req.files) && req.files.length > 0) {
    const uploads = req.files.map((file: Express.Multer.File) => {
      // Split file name by "." to remove extension
      const fileName = file.originalname.split(".");
      // Remove the last part (extension)
      fileName.pop();
      // Create timestamp
      const timestamp = Date.now();
      // Create public_id
      const public_id = `${timestamp}-${fileName.join("")}`;
      return uploadToCloudinary(file.buffer, "salem", public_id);
    });

    await Promise.all(uploads).then((results) => {
      // Process results
      results.forEach((result: any) => {
        images.push(result.secure_url);
        public_ids.push(result.public_id);
      });

      // Attach to request object
      req.body.images = images;
      req.body.imagesPublicIds = public_ids;
    });
  }

  // Next middleware
  next();
};
