import express from "express";

import { signUp, verifyOtp } from "../controllers/userController.js";
const router = express.Router();

router.post("/signup", signUp);
router.post("/signup/verify", verifyOtp);

export default router;
