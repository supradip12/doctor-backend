// import express from "express";

// import { signUp, verifyOtp } from "../controllers/doctorController";
// const router = express.Router();

// router.post("/signup", signUp);
// router.post("/signup/verify", verifyOtp);

// export default router;

import express from "express";
import { signUp, verifyOtp } from "../controllers/doctorController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signup/verify", verifyOtp);

export default router;
