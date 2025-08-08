import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createGroup,
  joinGroupByCode,
  setGroupAdmin,
  getMyGroups,
  getGroupDetails,
  triggerAlert
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", requireAuth, createGroup);
router.post("/join", requireAuth, joinGroupByCode); // join by code
router.post("/set-admin", requireAuth, setGroupAdmin);
router.get("/mine", requireAuth, getMyGroups);
router.get("/:groupId", requireAuth, getGroupDetails);
router.post("/trigger", triggerAlert);
export default router;