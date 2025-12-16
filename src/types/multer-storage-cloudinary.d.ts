declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { UploadApiOptions } from "cloudinary";

  interface CloudinaryStorageOptions {
    cloudinary: any;
    params?:
      | UploadApiOptions
      | ((
          req: Express.Request,
          file: Express.Multer.File
        ) => Promise<UploadApiOptions> | UploadApiOptions);
  }

  class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;
    _removeFile(
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }

  export = CloudinaryStorage;
}
