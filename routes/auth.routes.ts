import { Router } from "express";
import { loginHandler, profileHandler, registerHandler } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", loginHandler);

router.get("/profile",requireAuth,profileHandler);

router.post("/register", registerHandler);

export default router;