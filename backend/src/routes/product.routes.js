import { Router } from "express";
import {
  createProduct,
  createProductSchema,
  deleteProduct,
  getProductById,
  listProducts,
  productIdParamSchema,
  updateProduct,
  updateProductSchema
} from "../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", validate(productIdParamSchema), getProductById);
router.post("/", requireAuth, requireAdmin, validate(createProductSchema), createProduct);
router.put("/:id", requireAuth, requireAdmin, validate(updateProductSchema), updateProduct);
router.delete("/:id", requireAuth, requireAdmin, validate(productIdParamSchema), deleteProduct);

export default router;
