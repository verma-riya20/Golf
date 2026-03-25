import { Router } from "express";
import winnerController from "../controllers/winner.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// User routes
router.get("/user/wins", winnerController.getUserWins);
router.post("/:winnerId/proof", winnerController.submitWinnerProof);

// Admin routes
router.get("/admin/pending", requireAdmin, winnerController.getPendingWinners);
router.post("/:winnerId/approve", requireAdmin, winnerController.approveWinner);
router.post("/:winnerId/reject", requireAdmin, winnerController.rejectWinner);
router.post("/:winnerId/mark-paid", requireAdmin, winnerController.markWinnerAsPaid);
router.get("/admin/all", requireAdmin, winnerController.getAllWinners);
router.get("/admin/stats", requireAdmin, winnerController.getWinnerStats);

// Keep dynamic route last so it does not shadow static routes.
router.get("/:winnerId", winnerController.getWinner);

export default router;
