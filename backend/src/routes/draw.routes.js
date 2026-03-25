import { Router } from "express";
import drawController from "../controllers/draw.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", drawController.getDraws);
router.get("/:drawId", drawController.getDraw);

// Protected routes
router.use(requireAuth);

router.post("/", drawController.createDraw);
router.post("/:drawId/simulate", drawController.simulateDraw);
router.post("/:drawId/publish", drawController.publishDrawResults);
router.get("/user/participation", drawController.getUserDrawParticipation);

export default router;
