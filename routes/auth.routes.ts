import { Router } from "express";
import { loginHandler, profileHandler, registerHandler, resendCodeHandler, verifyHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", loginHandler);

router.get("/profile",requireAuth,profileHandler);

router.post("/register", registerHandler);

router.post("/verifyCodeRequest", verifyHandler);

router.post("/resendCodeRequest", resendCodeHandler);



export default router;