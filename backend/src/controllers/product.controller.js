import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { ProductModel } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    description: z.string().min(10),
    priceCents: z.number().int().positive(),
    currency: z.string().default("usd"),
    imageUrl: z.string().url().optional()
  })
});

export const updateProductSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    priceCents: z.number().int().positive().optional(),
    currency: z.string().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional()
  })
});

export const productIdParamSchema = z.object({
  params: z.object({ id: objectIdSchema })
});

export const listProducts = asyncHandler(async (req, res) => {
  const products = await ProductModel.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ products });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.validated.params.id);
  if (!product || !product.isActive) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
  }
  res.status(StatusCodes.OK).json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.create(req.validated.body);
  res.status(StatusCodes.CREATED).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findByIdAndUpdate(req.validated.params.id, req.validated.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
  }

  res.status(StatusCodes.OK).json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await ProductModel.findByIdAndUpdate(req.validated.params.id, { isActive: false });
  res.status(StatusCodes.NO_CONTENT).send();
});
