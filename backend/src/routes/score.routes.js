import { Router } from "express";
import scoreController from "../controllers/score.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.post("/", scoreController.addGolfScore);
router.get("/", scoreController.getUserScores);
router.get("/stats", scoreController.getScoreStats);
router.put("/:scoreId", scoreController.updateGolfScore);
router.delete("/:scoreId", scoreController.deleteGolfScore);

export default router;
