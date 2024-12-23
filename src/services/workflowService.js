import { db } from '../db/index.js';
import { workflows } from '../db/schema/schema.js';
import { eq } from 'drizzle-orm';

export const WorkflowType = {
    SEARCH: 'search',
    LIST: 'list'
};

export const WorkflowStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

export async function createWorkflow({ tenantId, type, name, params }) {
    const workflow = await db.insert(workflows).values({
        tenantId,
        type,
        status: WorkflowStatus.PENDING,
        name,
        params
    }).returning();

    return workflow[0];
}

export async function updateWorkflowN8nId(id, n8nWorkflowId) {
    const workflow = await db
        .update(workflows)
        .set({
            n8nWorkflowId,
            updatedAt: new Date()
        })
        .where(eq(workflows.id, id))
        .returning();

    return workflow[0];
}

export async function updateWorkflowStatus(id, status, result = null, error = null) {
    const workflow = await db
        .update(workflows)
        .set({
            status,
            result: result || workflows.result,
            error,
            updatedAt: new Date()
        })
        .where(eq(workflows.id, id))
        .returning();

    return workflow[0];
}

export async function getWorkflow(id) {
    const workflow = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, id))
        .limit(1);

    return workflow[0];
}

export async function getWorkflowsByTenant(tenantId) {
    return db
        .select()
        .from(workflows)
        .where(eq(workflows.tenantId, tenantId))
        .orderBy(workflows.createdAt);
}

export async function getWorkflowsByType(tenantId, type) {
    return db
        .select()
        .from(workflows)
        .where(eq(workflows.tenantId, tenantId))
        .where(eq(workflows.type, type))
        .orderBy(workflows.createdAt);
} 