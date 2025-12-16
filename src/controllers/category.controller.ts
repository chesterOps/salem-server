import Category from "../models/category.model";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
} from "../utils/handlerFactory";

export const createCategory = createOne(Category);

export const deleteCategory = deleteOne(Category);

export const getCategory = findOne(Category, "slug");

export const getCatgeories = findAll(Category);

export const updateCategory = catchAsync(async (req, res, next) => {
  // Fetch previous document
  const prevDoc = await Category.findById(req.params.id);

  // Check if document exists
  if (!prevDoc) return next(new AppError("Category does not exist", 404));

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  // Check if catgeory was updated
  if (!updatedCategory)
    return next(new AppError("Category does not exist", 404));

  // Send response
  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: updatedCategory.toObject(),
  });
});
