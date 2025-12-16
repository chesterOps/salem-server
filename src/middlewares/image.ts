import { Response, Request, NextFunction } from "express";

export const setImages = (req: Request, _res: Response, next: NextFunction) => {
  // Images array
  let images: string[] = [];
  let public_ids: string[] = [];

  // Check for image files
  if (Array.isArray(req.files) && req.files.length > 0) {
    req.files.forEach((file: Express.Multer.File) => {
      // Append file path to images array
      images.push(file.path);
      // Append public_id to images array
      public_ids.push(file.filename);
    });

    // Append images to body
    req.body.images = images;
    req.body.imagesPublicIds = public_ids;
  }

  // Next middleware
  next();
};
