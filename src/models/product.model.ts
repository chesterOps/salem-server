import mongoose from "mongoose";
import { deleteImages, slugify } from "../utils/helpers";

// Color schema
const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String,
    required: true,
  },
});

// Product schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product must have a title"],
    },
    published: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    sales: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    discount: {
      type: Number,
      default: undefined,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    tag: {
      type: String,
    },
    slug: String,
    images: {
      type: [String],
      default: undefined,
    },
    imagesPublicIds: {
      type: [String],
      default: undefined,
    },
    sizes: {
      type: [String],
      enum: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"],
      default: undefined,
    },
    colors: {
      type: [colorSchema],
      default: undefined,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
productSchema.index({ title: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });

// Main image virtual
productSchema.virtual("mainImage").get(function (this: any) {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
});

// Populate categories
productSchema.pre("find", function (next) {
  this.populate({
    path: "category",
    select: "name _id",
  });
  next();
});

// Add slug to product on save
productSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title);
  next();
});

// Add slug to product on update
productSchema.pre("findOneAndUpdate", async function (next) {
  // Get update object
  const update: any = this.getUpdate();
  // Check for title and update slug
  if (update && update.title) {
    update.slug = slugify(update.title);
    this.setUpdate(update);
  }
  // Next middleware
  next();
});

// Delete images
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    if (doc.imagesPublicIds) {
      // Get public ids
      const public_ids = doc.imagesPublicIds;
      // Delete images from cloudinary
      await deleteImages(public_ids);
    }
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
