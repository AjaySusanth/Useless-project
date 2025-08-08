export const alertGroup = (groupId, triggeredBy) =>
  axios.post(`http://localhost:5000/api/alerts/trigger`, { groupId, triggeredBy });

export const releaseGroupAlert = (groupId, triggeredBy) =>
  axios.post(`http://localhost:5000/api/alerts/release`, { groupId, triggeredBy });