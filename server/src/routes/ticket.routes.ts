import { Router } from "express";
import { 
    createTicket,
    getMyTickets,
 } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/events/:id/tickets",
  authenticate,
  authorize("EVENTEE"),
  createTicket,
);

router.get("/my-tickets", authenticate, authorize("EVENTEE"), getMyTickets);

export default router;
