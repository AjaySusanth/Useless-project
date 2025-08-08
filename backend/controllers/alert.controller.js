import {Alert} from '../models/models.js'

// POST /api/alerts/trigger { groupId }
export const triggerAlert = async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user._id;
  const group = await Group.findById(groupId);

  if (!group) return res.status(404).json({ error: "Group not found" });

  // Create alert in DB
  const alert = new Alert({
    group: groupId,
    triggeredBy: userId,
    active: true,
    startedAt: new Date(),
  });
  await alert.save();

  // Emit to group via Socket.IO
  const io = req.app.get("io");
  io.to(groupId).emit("alert-triggered", {
    groupId,
    triggeredBy: userId,
    message: "SHUT UP! MAMA'S CALLING!",
    alertId: alert._id,
    startedAt: alert.startedAt
  });

  res.status(201).json({ message: "Alert triggered", alert });
};
