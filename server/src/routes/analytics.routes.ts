import { Router } from "express";
import { getEventAnalytics } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";


const router = Router();

router.get(
  "/events/:id",
  authenticate,
  authorize("EVENT_CREATOR"),
  getEventAnalytics
);

export default router;