import { Router } from "express";
import { createCheckoutSession, checkoutSchema, listMyOrders } from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/checkout-session", requireAuth, validate(checkoutSchema), createCheckoutSession);
router.get("/my", requireAuth, listMyOrders);

export default router;
