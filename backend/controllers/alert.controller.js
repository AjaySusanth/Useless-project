
// In-memory alert status (per group, can have multiple active alerts)
export const groupAlertStatus = {};

export const triggerAlert = (req, res) => {
  const { groupId, triggeredBy } = req.body;
  if (!groupId || !triggeredBy) return res.status(400).json({ error: "groupId and triggeredBy required" });

  const startedAt = new Date().toISOString();
  const alertId = `${groupId}_${triggeredBy}_${Date.now()}`;

  if (!groupAlertStatus[groupId]) groupAlertStatus[groupId] = [];

  // Check if this user already has an active alert
  if (groupAlertStatus[groupId].some(a => a.triggeredBy === triggeredBy)) {
    return res.status(400).json({ error: "You already activated an alert" });
  }

  groupAlertStatus[groupId].push({ triggeredBy, startedAt, alertId });

  const io = req.app.get("io");
  io.to(groupId).emit("alert-triggered", {
    groupId,
    triggeredBy,
    message: "SHUT UP! MAMA'S CALLING!",
    alertId,
    startedAt,
    activeAlerts: groupAlertStatus[groupId],
  });
  res.json({ status: "alert sent" });
};

export const releaseAlert = (req, res) => {
  const { groupId, triggeredBy } = req.body;
  if (!groupId || !triggeredBy) return res.status(400).json({ error: "groupId and triggeredBy required" });

  if (!groupAlertStatus[groupId]) {
    return res.status(400).json({ error: "No active alert to release" });
  }

  // Remove alert for this user
  groupAlertStatus[groupId] = groupAlertStatus[groupId].filter(a => a.triggeredBy !== triggeredBy);

  const io = req.app.get("io");
  io.to(groupId).emit("alert-released", {
    groupId,
    triggeredBy,
    message: "Alert released.",
    alertId: `${groupId}_released_${Date.now()}`,
    activeAlerts: groupAlertStatus[groupId], // Remaining alerts
  });
  res.json({ status: "alert released" });
};