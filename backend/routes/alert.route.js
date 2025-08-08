import express from "express";
import { triggerAlert } from "../controllers/alert.controller.js";
import {requireAuth} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/trigger", requireAuth, triggerAlert);

export default router;