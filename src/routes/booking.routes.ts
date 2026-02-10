import { Router } from "express";
import { role, verifyJWT } from "../middleware/auth.middleware.ts";
import { cancelBooking, createBooking, getBooking } from "../controller/booking.controller.ts";

const router = Router();

router.route("/").post(verifyJWT,role("customer"),createBooking);
router.route("/").get(verifyJWT,role("customer"),getBooking);
router.route("/:bookingId/cancel").put(verifyJWT,role("customer"),cancelBooking);

export default router;