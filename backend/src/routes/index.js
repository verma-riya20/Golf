import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import scoreRoutes from "./score.routes.js";
import charityRoutes from "./charity.routes.js";
import drawRoutes from "./draw.routes.js";
import winnerRoutes from "./winner.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "backend", timestamp: new Date().toISOString() });
});

// Golf Charity Platform routes
router.use("/auth", authRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/scores", scoreRoutes);
router.use("/charities", charityRoutes);
router.use("/draws", drawRoutes);
router.use("/winners", winnerRoutes);
router.use("/users", userRoutes);

// Legacy product/order routes (for backward compatibility)
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;
