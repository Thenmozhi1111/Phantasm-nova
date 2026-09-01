import { Router } from "express";
import { createPayment, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/payment/create", createPayment);
router.get("/payment/verify", verifyPayment);

export default router;
