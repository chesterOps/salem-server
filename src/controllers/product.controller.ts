import { isValidObjectId } from "mongoose";
import Category from "../models/category.model";
import Product from "../models/product.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { deleteOne, findAll, findOne } from "../utils/handlerFactory";
import { deleteImages } from "../utils/helpers";

export const createProduct = catchAsync(async (req, res, next) => {
  // Check if categories provided exist
  let category = req.body.category;
  // Check for multiple categories
  if (!Array.isArray(category)) category = [category];
  if (category && category.length > 0) {
    const existingCategories = await Category.find({
      _id: { $in: category },
    });

    if (existingCategories.length !== category.length) {
      return next(
        new AppError("One or more provided categories do not exist", 400)
      );
    }
  }

  // Create product
  const product = await Product.create(req.body);

  // Send response
  res.status(201).json({
    status: "success",
    data: product,
  });
});

export const getProduct = findOne(Product, "slug");

export const getProducts = findAll(Product, "title");

export const deleteProduct = deleteOne(Product);

export const updateProduct = catchAsync(async (req, res, next) => {
  // Fetch previous document
  const prevDoc = await Product.findById(req.params.id);

  // Check if product exists
  if (!prevDoc) return next(new AppError("Product does not exist", 404));

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  // Check if product was updated
  if (!updatedProduct) return next(new AppError("Product does not exist", 404));

  // Check for new images
  if (prevDoc.imagesPublicIds && req.body.imagesPublicIds) {
    // Get public ids
    const public_ids = prevDoc.imagesPublicIds;

    // Delete previous images from cloudinary
    await deleteImages(public_ids);
  }

  // Send response
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: updatedProduct.toObject(),
  });
});

export const getProductsByCategory = catchAsync(async (req, res, next) => {
  // Get category slug
  const { slug } = req.params;

  // Find category by slug
  const category = await Category.findOne({ slug });

  // Check if category was found
  if (!category) return next(new AppError("Category not found", 404));

  // Fetch products with that category
  const products = await Product.find({
    category: { $in: [category._id] },
  }).sort({ createdAt: -1 });

  // Send response
  res.status(200).json({
    status: "success",
    length: products.length,
    data: products,
  });
});

export const getRelatedProducts = catchAsync(async (req, res, next) => {
  // Get id or slug
  const { id } = req.params;

  // Find product using id or slug
  const product = isValidObjectId(id)
    ? await Product.findById(id)
    : await Product.findOne({ slug: id });

  // Check if product was found
  if (!product) return next(new AppError("Product does not exist", 404));

  // Fetch related products
  let related = await Product.find({
    // Exclude current id
    _id: { $ne: product._id },
    // Match any shared category or tag
    $or: [{ category: { $in: product.category } }, { tag: product.tag }],
  }).limit(4);

  // Check if related products were found
  if (!related || related.length === 0)
    related = await Product.find({ _id: { $ne: product._id } }).limit(4);

  // Send response
  res.status(200).json({
    status: "success",
    length: related.length,
    data: related,
  });
});
