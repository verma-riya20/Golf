import { Router } from "express";
import drawController from "../controllers/draw.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", drawController.getDraws);

// Protected routes
router.use(requireAuth);

router.get("/user/participation", drawController.getUserDrawParticipation);

// Admin-only draw lifecycle actions.
router.post("/", requireAdmin, drawController.createDraw);
router.post("/:drawId/simulate", requireAdmin, drawController.simulateDraw);
router.post("/:drawId/publish", requireAdmin, drawController.publishDrawResults);

// Keep dynamic route last to avoid catching static paths like /user/participation.
router.get("/:drawId", drawController.getDraw);

export default router;
