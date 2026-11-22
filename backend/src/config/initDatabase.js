const bcrypt = require("bcryptjs");
const pool = require("./database");

async function initDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(150) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'TEAM_MEMBER',
        domain VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table ready");

    // Seed default demo users if they don't exist yet
    const leaderHash = bcrypt.hashSync("leader123", 10);
    const memberHash = bcrypt.hashSync("member123", 10);
    await client.query(`
      INSERT INTO users (name, email, password, role, domain)
      VALUES 
        ('Demo Leader', 'leader@hackflow.ai', $1, 'TEAM_LEADER', 'Management'),
        ('Demo Member', 'member@hackflow.ai', $2, 'TEAM_MEMBER', 'Backend'),
        ('Aarav Sharma', 'aarav@hackflow.ai', $2, 'TEAM_MEMBER', 'Frontend'),
        ('Diya Patel', 'diya@hackflow.ai', $2, 'TEAM_MEMBER', 'AI')
      ON CONFLICT (email) DO NOTHING;
    `, [leaderHash, memberHash]);

    // 2. Projects Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        problem_statement TEXT,
        description TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'GENERATING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Projects table ready");

    // 3. Tasks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Assigned',
        priority VARCHAR(50) DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tasks table ready");

    // 4. Workflow Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS workflow (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        step_name TEXT,
        step_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Workflow table ready");

    // 5. Progress Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        completion_percentage INTEGER DEFAULT 0,
        note TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Progress table ready");

    // 6. Summary Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS summary (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        summary_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Summary table ready");

    // 7. PPT Outputs Table (with JSONB support)
    await client.query(`
      CREATE TABLE IF NOT EXISTS ppt_outputs (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        ppt_text TEXT,
        slides_json JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("PPT table ready");

    // --- IDEMPOTENT MIGRATIONS FOR EXISTING DATABASES ---
    // Ensure slides_json column exists in ppt_outputs
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ppt_outputs' AND column_name = 'slides_json'
        ) THEN
          ALTER TABLE ppt_outputs ADD COLUMN slides_json JSONB;
        END IF;
      END $$;
    `);

    // Helper function to safely apply foreign key constraints if not yet applied
    const constraints = [
      {
        table: "projects",
        name: "fk_projects_created_by",
        sql: "FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL"
      },
      {
        table: "tasks",
        name: "fk_tasks_project_id",
        sql: "FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE"
      },
      {
        table: "tasks",
        name: "fk_tasks_assigned_to",
        sql: "FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL"
      },
      {
        table: "workflow",
        name: "fk_workflow_project_id",
        sql: "FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE"
      },
      {
        table: "progress",
        name: "fk_progress_project_id",
        sql: "FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE"
      },
      {
        table: "progress",
        name: "fk_progress_member_id",
        sql: "FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE SET NULL"
      },
      {
        table: "summary",
        name: "fk_summary_project_id",
        sql: "FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE"
      },
      {
        table: "ppt_outputs",
        name: "fk_ppt_project_id",
        sql: "FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE"
      }
    ];

    for (const c of constraints) {
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = '${c.name}' AND table_name = '${c.table}'
          ) THEN
            BEGIN
              ALTER TABLE ${c.table} ADD CONSTRAINT ${c.name} ${c.sql};
            EXCEPTION
              WHEN duplicate_object OR undefined_table THEN
                NULL;
            END;
          END IF;
        END $$;
      `);
    }

    await client.query("COMMIT");
    console.log("Connected to PostgreSQL — All relational models and foreign key constraints verified successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating/migrating tables:", err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initDatabase };
