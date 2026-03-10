import { Router } from "express";
import { role, verifyJWT } from "../middleware/auth.middleware";
import { createHotel, createRoom, getHotelById, getHotels } from "../controller/hotels.controller";

const router = Router();

router.route("/").post(verifyJWT,role("owner"),createHotel);
router.route("/:hotelId/rooms").post(verifyJWT,role("owner"),createRoom);
router.route("/").get(verifyJWT,getHotels);
router.route("/:hotelId").get(verifyJWT,getHotelById);

export default router;