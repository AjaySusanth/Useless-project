export const alertGroup = (groupId, triggeredBy) =>
  axios.post(`https://useless-project-py4u.onrender.com/api/alerts/trigger`, { groupId, triggeredBy });

export const releaseGroupAlert = (groupId, triggeredBy) =>
  axios.post(`https://useless-project-py4u.onrender.com/api/alerts/release`, { groupId, triggeredBy });