import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateBody } from "../middleware/validate.js";
import {
  createRegistration,
  lookupTeam,
  registrationSchema,
} from "../controllers/registrationController.js";

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, validateBody(registrationSchema), createRegistration);
router.get("/team", lookupTeam);

export default router;
