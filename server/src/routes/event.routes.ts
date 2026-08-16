import { Router } from "express";
import { 
    createEvent, 
    getAllEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    cancelEvent,
    getEventShareLinks,
} from "../controllers/event.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";  


const router = Router();

router.post("/", authenticate, authorize("EVENT_CREATOR"), createEvent);
router.get("/", getAllEvents);
router.get("/my-events", authenticate, authorize("EVENT_CREATOR"), getMyEvents);
router.patch("/:id/cancel", authenticate, authorize("EVENT_CREATOR"), cancelEvent);
router.get("/:id", getEventById);
router.patch("/:id", authenticate, authorize("EVENT_CREATOR"), updateEvent);
router.get("/:id/share", getEventShareLinks);


export default router;