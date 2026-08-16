import { Router } from "express";
import { 
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { paymentRateLimiter } from "../middleware/rateLimiter";


const router = Router();

router.post(
  "/initialize",
  authenticate,
  paymentRateLimiter,
  initializePayment
);

router.get("/verify/:reference", authenticate, verifyPayment);

export default router;