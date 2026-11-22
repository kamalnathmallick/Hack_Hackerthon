const db = require("../config/database");

function getOutputByProjectId(projectId) {
  return (
    db.prepare("SELECT * FROM project_outputs WHERE project_id = ?").get(projectId) || {
      project_id: Number(projectId),
      summary_text: "",
      ppt_text: "",
      risk_text: "",
      judge_feedback_text: "",
      feasibility_text: "",
      mvp_text: "",
      feature_text: "",
      module_text: ""
    }
  );
}

function upsertOutput(projectId, payload) {
  const existing = db
    .prepare("SELECT id FROM project_outputs WHERE project_id = ?")
    .get(projectId);

  const next = {
    summary_text: payload.summaryText ?? "",
    ppt_text: payload.pptText ?? "",
    risk_text: payload.riskText ?? "",
    judge_feedback_text: payload.judgeFeedbackText ?? "",
    feasibility_text: payload.feasibilityText ?? "",
    mvp_text: payload.mvpText ?? "",
    feature_text: payload.featureText ?? "",
    module_text: payload.moduleText ?? ""
  };

  if (existing) {
    db.prepare(
      `UPDATE project_outputs
       SET summary_text = ?, ppt_text = ?, risk_text = ?, judge_feedback_text = ?,
           feasibility_text = ?, mvp_text = ?, feature_text = ?, module_text = ?, updated_at = CURRENT_TIMESTAMP
       WHERE project_id = ?`
    ).run(
      next.summary_text,
      next.ppt_text,
      next.risk_text,
      next.judge_feedback_text,
      next.feasibility_text,
      next.mvp_text,
      next.feature_text,
      next.module_text,
      projectId
    );
  } else {
    db.prepare(
      `INSERT INTO project_outputs
       (project_id, summary_text, ppt_text, risk_text, judge_feedback_text, feasibility_text, mvp_text, feature_text, module_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      projectId,
      next.summary_text,
      next.ppt_text,
      next.risk_text,
      next.judge_feedback_text,
      next.feasibility_text,
      next.mvp_text,
      next.feature_text,
      next.module_text
    );
  }

  return getOutputByProjectId(projectId);
}

module.exports = {
  getOutputByProjectId,
  upsertOutput
};
