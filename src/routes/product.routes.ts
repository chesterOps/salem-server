import upload from "../middlewares/multer";
import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getProductsByCategory,
  getRelatedProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { uploadImages } from "../middlewares/image";

// Product router
const Router = express.Router();

Router.get("/:id/related", getRelatedProducts);

Router.get("/category/:slug", getProductsByCategory);

Router.route("/")
  .get(getProducts)
  .post(
    protect,
    authorize("admin"),
    upload.array("images"),
    uploadImages,
    createProduct
  );

Router.route("/:id")
  .get(getProduct)
  .delete(protect, authorize("admin"), deleteProduct)
  .patch(
    protect,
    authorize("admin"),
    upload.array("images"),
    uploadImages,
    updateProduct
  );

export default Router;
