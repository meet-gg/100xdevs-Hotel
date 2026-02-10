import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import { review } from "../controller/reviews.controller.ts";

const router = Router();

router.route("/reviews").post(verifyJWT, review);

export default router;