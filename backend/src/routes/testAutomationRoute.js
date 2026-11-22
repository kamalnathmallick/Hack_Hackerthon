const express = require("express");
const { projectService } = require("../services/projectService");
const pool = require("../config/database");

const router = express.Router();

router.post("/automation", async (req, res) => {
  try {
    const project = await projectService.createProject({
      title: "Auto Test Project",
      problem_statement: "Test automation pipeline",
      description: "This project triggers agents automatically",
      created_by: 1,
      status: "ongoing"
    });

    // STEP 9 — AUTO VERIFY DATABASE AFTER EXECUTION
    const projectsCount = await pool.query("SELECT COUNT(*) FROM projects;");
    const workflowCount = await pool.query("SELECT COUNT(*) FROM workflow;");
    const tasksCount = await pool.query("SELECT COUNT(*) FROM tasks;");
    const summaryCount = await pool.query("SELECT COUNT(*) FROM summary;");
    const pptCount = await pool.query("SELECT COUNT(*) FROM ppt_outputs;");

    if (projectsCount.rows[0].count > 0) console.log("Projects created");
    if (workflowCount.rows[0].count > 0) console.log("Workflow generated");
    if (tasksCount.rows[0].count > 0) console.log("Tasks created");
    if (summaryCount.rows[0].count > 0) console.log("Summary generated");
    if (pptCount.rows[0].count > 0) console.log("PPT generated");

    res.json({
      message: "Automation completed",
      project
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
