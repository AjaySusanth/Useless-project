
export const getProfile = async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const user = req.user;
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      groups: user.groups,
      callStats: user.callStats,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};