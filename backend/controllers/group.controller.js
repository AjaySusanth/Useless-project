
import { User,Group } from "../models/models.js";

function generateJoinCode(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// Create a group (creator is admin)
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existing = await Group.findOne({ name });
    if (existing) return res.status(409).json({ error: "Group name exists" });

    const joinCode = generateJoinCode();
    const group = new Group({
      name,
      description,
      joinCode,
      members: [req.user._id],
      admins: [req.user._id],
    });
    await group.save();

    await User.findByIdAndUpdate(req.user._id, { $push: { groups: group._id } });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Join by joinCode
export const joinGroupByCode = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const group = await Group.findOne({ joinCode });
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.members.includes(req.user._id))
      return res.status(400).json({ error: "Already a member" });

    group.members.push(req.user._id);
    await group.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { groups: group._id } });

    res.json({ message: "Joined group", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set group admin (only existing admin can do this)
export const setGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(req.user._id))
      return res.status(403).json({ error: "Only admins can set other admins" });

    if (!group.members.includes(userId))
      return res.status(400).json({ error: "User is not a member" });

    if (!group.admins.includes(userId)) {
      group.admins.push(userId);
      await group.save();
    }

    res.json({ message: "User set as admin", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    // req.user._id should be set by the requireAuth middleware
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "username displayName avatarUrl")
      .populate("admins", "username displayName avatarUrl");

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};