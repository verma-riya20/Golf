import { Router } from "express";
import { login, loginSchema, logout, me, refresh, register, registerSchema } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
