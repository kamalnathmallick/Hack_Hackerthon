const db = require("../config/database");

function getLeaderDashboard(userId) {
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM projects WHERE created_by = ?) AS totalProjects,
        (SELECT COUNT(*) FROM tasks) AS totalTasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Completed') AS completedTasks,
        (SELECT COUNT(*) FROM users WHERE role = 'TEAM_MEMBER') AS totalMembers`
    )
    .get(userId);

  const recentProjects = db
    .prepare("SELECT id, title, created_at FROM projects WHERE created_by = ? ORDER BY id DESC LIMIT 5")
    .all(userId);

  const statusSplit = db
    .prepare("SELECT status, COUNT(*) as count FROM tasks GROUP BY status")
    .all();

  const statusBuckets = db
    .prepare(
      `SELECT
        SUM(CASE WHEN IFNULL(pr.progress_value, 0) = 0 THEN 1 ELSE 0 END) AS upcomingProjects,
        SUM(CASE WHEN IFNULL(pr.progress_value, 0) > 0 AND IFNULL(pr.progress_value, 0) < 100 THEN 1 ELSE 0 END) AS ongoingProjects,
        SUM(CASE WHEN IFNULL(pr.progress_value, 0) = 100 THEN 1 ELSE 0 END) AS completedProjects
       FROM projects p
       LEFT JOIN progress pr ON pr.project_id = p.id
       WHERE p.created_by = ?`
    )
    .get(userId);

  return {
    ...totals,
    ...statusBuckets,
    completionRate:
      totals.totalTasks > 0 ? Math.round((totals.completedTasks / totals.totalTasks) * 100) : 0,
    recentProjects,
    statusSplit
  };
}

function getMemberDashboard(userId) {
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = ?) AS totalTasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status = 'Completed') AS completedTasks,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = ? AND status IN ('Assigned', 'In Progress')) AS activeTasks`
    )
    .get(userId, userId, userId);

  const myTasks = db
    .prepare(
      `SELECT t.id, t.title, t.status, t.priority, p.title AS project_title
       FROM tasks t
       INNER JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to = ?
       ORDER BY t.updated_at DESC LIMIT 8`
    )
    .all(userId);

  return {
    ...totals,
    completionRate:
      totals.totalTasks > 0 ? Math.round((totals.completedTasks / totals.totalTasks) * 100) : 0,
    myTasks
  };
}

module.exports = {
  getLeaderDashboard,
  getMemberDashboard
};
