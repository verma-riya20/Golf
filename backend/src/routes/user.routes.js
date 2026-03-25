import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/", userController.listUsers);

export default router;
