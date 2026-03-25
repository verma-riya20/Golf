import { Router } from "express";
import charityController from "../controllers/charity.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", charityController.listCharities);
router.get("/featured", charityController.getFeaturedCharities);
router.get("/:charityId", charityController.getCharity);

// Protected routes
router.use(requireAuth);

router.post("/select", charityController.selectCharityForUser);
router.post("/", requireAdmin, charityController.createCharity);
router.put("/:charityId", requireAdmin, charityController.updateCharity);
router.delete("/:charityId", requireAdmin, charityController.deleteCharity);
router.get("/stats/admin", requireAdmin, charityController.getCharityStats);

export default router;
