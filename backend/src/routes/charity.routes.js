import { Router } from "express";
import charityController from "../controllers/charity.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", charityController.listCharities);
router.get("/featured", charityController.getFeaturedCharities);
router.get("/:charityId", charityController.getCharity);

// Protected routes
router.use(requireAuth);

router.post("/", charityController.createCharity);
router.put("/:charityId", charityController.updateCharity);
router.delete("/:charityId", charityController.deleteCharity);
router.post("/select", charityController.selectCharityForUser);
router.get("/stats/admin", charityController.getCharityStats);

export default router;
