import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../middleware/auth.js";
import {
  login,
  logout,
  session,
  listRegistrations,
  forgotPassword,
  resetPassword,
} from "../controllers/adminController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/admin/login", authLimiter, login);
router.post("/admin/logout", logout);
router.get("/admin/session", session);
router.get("/admin/registrations", requireAdmin, listRegistrations);

router.post("/admin/forgot-password", authLimiter, forgotPassword);
router.post("/admin/reset-password", authLimiter, resetPassword);

export default router;
