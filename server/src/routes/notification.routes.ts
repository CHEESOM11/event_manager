import { Router } from "express";
import { getMyNotifications, markNotificationAsRead } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getMyNotifications
);

router.patch(
    "/:id/read",
    authenticate,
    markNotificationAsRead
);

export default router;