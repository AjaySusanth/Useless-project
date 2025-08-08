import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const router = express.Router();

// Add the getProfile route (protected)
router.get("/profile", requireAuth, getProfile);

export default router;