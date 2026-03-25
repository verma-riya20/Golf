import { Router } from "express";
import subscriptionController from "../controllers/subscription.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.post("/", subscriptionController.createSubscription);
router.get("/", subscriptionController.getUserSubscription);
router.delete("/", subscriptionController.cancelSubscription);
router.get("/status/check", subscriptionController.checkSubscriptionStatus);

export default router;
