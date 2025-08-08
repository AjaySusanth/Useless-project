import express from "express";
import { triggerAlert, releaseAlert } from "../controllers/alert.controller.js";

const router = express.Router();

router.post("/trigger", triggerAlert);
router.post("/release", releaseAlert);

export default router;