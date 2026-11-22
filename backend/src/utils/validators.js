const { z } = require("zod");
const { ROLES, TASK_PRIORITIES, TASK_STATUSES } = require("../config/constants");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().optional(),
    domain: z.string().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    problemStatement: z.string().min(10),
    description: z.string().optional().default(""),
    objective: z.string().optional().default(""),
    dataSources: z.array(z.string()).optional().default([])
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    problemStatement: z.string().min(10).optional(),
    description: z.string().optional(),
    objective: z.string().optional(),
    dataSources: z.array(z.string()).optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional()
});

const createTaskSchema = z.object({
  body: z.object({
    projectId: z.number().int().positive(),
    assignedTo: z.number().int().positive().optional(),
    memberEmail: z.string().email().optional(),
    domain: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional().default(""),
    instructions: z.string().optional().default(""),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional()
});

const workflowGenerateSchema = z.object({
  body: z.object({
    projectId: z.number().int().positive()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const projectIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional()
});

const progressSchema = z.object({
  body: z.object({
    progressValue: z.number().min(0).max(100),
    note: z.string().optional().default("")
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional()
});

const dashboardSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    userId: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  workflowGenerateSchema,
  projectIdParamSchema,
  progressSchema,
  dashboardSchema
};
