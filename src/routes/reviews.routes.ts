import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { review } from "../controller/reviews.controller";

const router = Router();

router.route("/reviews").post(verifyJWT, review);

export default router;