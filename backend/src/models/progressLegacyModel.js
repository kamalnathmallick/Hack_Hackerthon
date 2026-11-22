const db = require("../config/database");

function getProgressByProjectId(projectId) {
  const row = db.prepare("SELECT * FROM progress WHERE project_id = ?").get(projectId);
  return row || { project_id: Number(projectId), progress_value: 0, note: "" };
}

function upsertProgress({ projectId, progressValue, note }) {
  const existing = db.prepare("SELECT id FROM progress WHERE project_id = ?").get(projectId);
  if (existing) {
    db.prepare(
      `UPDATE progress
       SET progress_value = ?, note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE project_id = ?`
    ).run(progressValue, note || "", projectId);
  } else {
    db.prepare(
      `INSERT INTO progress (project_id, progress_value, note)
       VALUES (?, ?, ?)`
    ).run(projectId, progressValue, note || "");
  }
  return getProgressByProjectId(projectId);
}

module.exports = {
  getProgressByProjectId,
  upsertProgress
};
