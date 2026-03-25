import { Router } from "express";
import winnerController from "../controllers/winner.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// User routes
router.post("/:winnerId/proof", winnerController.submitWinnerProof);
router.get("/:winnerId", winnerController.getWinner);
router.get("/user/wins", winnerController.getUserWins);

// Admin routes
router.get("/admin/pending", winnerController.getPendingWinners);
router.post("/:winnerId/approve", winnerController.approveWinner);
router.post("/:winnerId/reject", winnerController.rejectWinner);
router.post("/:winnerId/mark-paid", winnerController.markWinnerAsPaid);
router.get("/admin/all", winnerController.getAllWinners);
router.get("/admin/stats", winnerController.getWinnerStats);

export default router;
