import { Router } from "express";   
import { 
    getTicketQRCode,
    verifyTicket,
    scanQRCode,
 } from "../controllers/qr.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get("/:ticketCode", authenticate, getTicketQRCode);
router.patch("/:ticketCode/verify", authenticate, authorize("EVENT_CREATOR"), verifyTicket);
router.post("/scan", authenticate, authorize("EVENT_CREATOR"), scanQRCode);

export default router;