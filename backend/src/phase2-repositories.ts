// Phase 2 repository functions for database operations
// Provides CRUD operations for groups, workout tracking, and credit management

import type {
  Group,
  GroupMembership,
  WorkoutAssignment,
  WorkoutSession,
  WorkoutSetLog,
  SessionType,
  CreditPurchase,
} from './phase2-types';

// ===== Groups =====

export async function createGroup(
  db: D1Database,
  id: string,
  name: string,
  description: string | null
): Promise<Group> {
  await db
    .prepare(
      'INSERT INTO groups (id, name, description) VALUES (?, ?, ?)'
    )
    .bind(id, name, description)
    .run();

  const result = await db
    .prepare('SELECT * FROM groups WHERE id = ?')
    .bind(id)
    .first<Group>();

  if (!result) {
    throw new Error('Failed to create group');
  }

  return result;
}

export async function getGroup(db: D1Database, id: string): Promise<Group | null> {
  return await db
    .prepare('SELECT * FROM groups WHERE id = ?')
    .bind(id)
    .first<Group>();
}

export async function listGroups(db: D1Database, activeOnly = true): Promise<Group[]> {
  const query = activeOnly
    ? 'SELECT * FROM groups WHERE is_active = 1 ORDER BY name'
    : 'SELECT * FROM groups ORDER BY name';

  const result = await db.prepare(query).all<Group>();
  return result.results || [];
}

export async function updateGroup(
  db: D1Database,
  id: string,
  updates: { name?: string; description?: string; is_active?: number }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.is_active);
  }

  if (fields.length === 0) return;

  values.push(id);
  await db
    .prepare(`UPDATE groups SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

// ===== Group Memberships =====

export async function addGroupMembership(
  db: D1Database,
  id: string,
  groupId: string,
  clientId: number,
  startDate: string,
  endDate: string | null,
  createdBy: number
): Promise<GroupMembership> {
  // Check for overlapping memberships (application-level enforcement)
  const overlapping = await db
    .prepare(
      `SELECT id FROM group_memberships
       WHERE group_id = ? AND client_id = ?
       AND start_date <= ?
       AND (end_date IS NULL OR end_date >= ?)`
    )
    .bind(groupId, clientId, endDate || '9999-12-31', startDate)
    .first();

  if (overlapping) {
    throw new Error('Overlapping membership exists for this client and group');
  }

  await db
    .prepare(
      `INSERT INTO group_memberships
       (id, group_id, client_id, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, groupId, clientId, startDate, endDate, createdBy)
    .run();

  const result = await db
    .prepare('SELECT * FROM group_memberships WHERE id = ?')
    .bind(id)
    .first<GroupMembership>();

  if (!result) {
    throw new Error('Failed to create group membership');
  }

  return result;
}

export async function listGroupMembers(
  db: D1Database,
  groupId: string,
  activeOnly = true
): Promise<GroupMembership[]> {
  const now = new Date().toISOString();
  const query = activeOnly
    ? `SELECT * FROM group_memberships
       WHERE group_id = ?
       AND start_date <= ?
       AND (end_date IS NULL OR end_date >= ?)
       ORDER BY start_date DESC`
    : 'SELECT * FROM group_memberships WHERE group_id = ? ORDER BY start_date DESC';

  const stmt = db.prepare(query);
  const result = activeOnly
    ? await stmt.bind(groupId, now, now).all<GroupMembership>()
    : await stmt.bind(groupId).all<GroupMembership>();

  return result.results || [];
}

export async function removeGroupMembership(
  db: D1Database,
  membershipId: string,
  endDate: string
): Promise<void> {
  await db
    .prepare('UPDATE group_memberships SET end_date = ? WHERE id = ?')
    .bind(endDate, membershipId)
    .run();
}

// ===== Workout Assignments =====

export async function createWorkoutAssignment(
  db: D1Database,
  id: string,
  workoutId: string,
  assigneeType: 'group' | 'client',
  assigneeId: string,
  startDate: string,
  endDate: string | null,
  createdBy: number
): Promise<WorkoutAssignment> {
  await db
    .prepare(
      `INSERT INTO workout_assignments
       (id, workout_id, assignee_type, assignee_id, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, workoutId, assigneeType, assigneeId, startDate, endDate, createdBy)
    .run();

  const result = await db
    .prepare('SELECT * FROM workout_assignments WHERE id = ?')
    .bind(id)
    .first<WorkoutAssignment>();

  if (!result) {
    throw new Error('Failed to create workout assignment');
  }

  return result;
}

export async function listWorkoutAssignments(
  db: D1Database,
  filters: {
    workoutId?: string;
    assigneeType?: 'group' | 'client';
    assigneeId?: string;
    activeOnly?: boolean;
  }
): Promise<WorkoutAssignment[]> {
  const conditions: string[] = [];
  const values: any[] = [];

  if (filters.workoutId) {
    conditions.push('workout_id = ?');
    values.push(filters.workoutId);
  }
  if (filters.assigneeType) {
    conditions.push('assignee_type = ?');
    values.push(filters.assigneeType);
  }
  if (filters.assigneeId) {
    conditions.push('assignee_id = ?');
    values.push(filters.assigneeId);
  }
  if (filters.activeOnly) {
    const now = new Date().toISOString();
    conditions.push('start_date <= ?');
    conditions.push('(end_date IS NULL OR end_date >= ?)');
    values.push(now, now);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM workout_assignments ${whereClause} ORDER BY start_date DESC`;

  const result = await db.prepare(query).bind(...values).all<WorkoutAssignment>();
  return result.results || [];
}

// ===== Workout Sessions =====

export async function createWorkoutSession(
  db: D1Database,
  id: string,
  clientId: number,
  workoutId: string,
  assignmentId: string | null,
  performedAt: string,
  notes: string | null
): Promise<WorkoutSession> {
  await db
    .prepare(
      `INSERT INTO workout_sessions
       (id, client_id, workout_id, assignment_id, performed_at, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, clientId, workoutId, assignmentId, performedAt, notes)
    .run();

  const result = await db
    .prepare('SELECT * FROM workout_sessions WHERE id = ?')
    .bind(id)
    .first<WorkoutSession>();

  if (!result) {
    throw new Error('Failed to create workout session');
  }

  return result;
}

export async function getWorkoutSession(
  db: D1Database,
  id: string
): Promise<WorkoutSession | null> {
  return await db
    .prepare('SELECT * FROM workout_sessions WHERE id = ?')
    .bind(id)
    .first<WorkoutSession>();
}

export async function listClientWorkoutSessions(
  db: D1Database,
  clientId: number,
  limit = 50
): Promise<WorkoutSession[]> {
  const result = await db
    .prepare(
      'SELECT * FROM workout_sessions WHERE client_id = ? ORDER BY performed_at DESC LIMIT ?'
    )
    .bind(clientId, limit)
    .all<WorkoutSession>();

  return result.results || [];
}

// ===== Workout Set Logs =====

export async function createWorkoutSetLog(
  db: D1Database,
  id: string,
  workoutSessionId: string,
  exerciseId: string,
  setIndex: number,
  reps: number | null,
  weight: number | null,
  restSeconds: number | null,
  notes: string | null
): Promise<WorkoutSetLog> {
  await db
    .prepare(
      `INSERT INTO workout_set_logs
       (id, workout_session_id, exercise_id, set_index, reps, weight, rest_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, workoutSessionId, exerciseId, setIndex, reps, weight, restSeconds, notes)
    .run();

  const result = await db
    .prepare('SELECT * FROM workout_set_logs WHERE id = ?')
    .bind(id)
    .first<WorkoutSetLog>();

  if (!result) {
    throw new Error('Failed to create workout set log');
  }

  return result;
}

export async function listWorkoutSetLogs(
  db: D1Database,
  workoutSessionId: string
): Promise<WorkoutSetLog[]> {
  const result = await db
    .prepare(
      'SELECT * FROM workout_set_logs WHERE workout_session_id = ? ORDER BY set_index'
    )
    .bind(workoutSessionId)
    .all<WorkoutSetLog>();

  return result.results || [];
}

// ===== Credit Purchases =====

export async function createCreditPurchase(
  db: D1Database,
  id: string,
  clientId: number,
  provider: string,
  providerTxnId: string,
  dollarsAmount: number,
  creditsAmount: number,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  purchasedAt: string
): Promise<CreditPurchase> {
  // Idempotent insert - check if provider_txn_id already exists
  const existing = await db
    .prepare('SELECT * FROM credit_purchases WHERE provider_txn_id = ?')
    .bind(providerTxnId)
    .first<CreditPurchase>();

  if (existing) {
    return existing;
  }

  await db
    .prepare(
      `INSERT INTO credit_purchases
       (id, client_id, provider, provider_txn_id, dollars_amount, credits_amount, status, purchased_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, clientId, provider, providerTxnId, dollarsAmount, creditsAmount, status, purchasedAt)
    .run();

  const result = await db
    .prepare('SELECT * FROM credit_purchases WHERE id = ?')
    .bind(id)
    .first<CreditPurchase>();

  if (!result) {
    throw new Error('Failed to create credit purchase');
  }

  return result;
}

export async function updateCreditPurchaseStatus(
  db: D1Database,
  providerTxnId: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded'
): Promise<void> {
  await db
    .prepare('UPDATE credit_purchases SET status = ? WHERE provider_txn_id = ?')
    .bind(status, providerTxnId)
    .run();
}

export async function listClientCreditPurchases(
  db: D1Database,
  clientId: number
): Promise<CreditPurchase[]> {
  const result = await db
    .prepare(
      'SELECT * FROM credit_purchases WHERE client_id = ? ORDER BY purchased_at DESC'
    )
    .bind(clientId)
    .all<CreditPurchase>();

  return result.results || [];
}

// ===== Session Types =====

export async function createSessionType(
  db: D1Database,
  id: string,
  name: string,
  creditsCost: number,
  durationMinutes: number
): Promise<SessionType> {
  await db
    .prepare(
      'INSERT INTO session_types (id, name, credits_cost, duration_minutes) VALUES (?, ?, ?, ?)'
    )
    .bind(id, name, creditsCost, durationMinutes)
    .run();

  const result = await db
    .prepare('SELECT * FROM session_types WHERE id = ?')
    .bind(id)
    .first<SessionType>();

  if (!result) {
    throw new Error('Failed to create session type');
  }

  return result;
}

export async function listSessionTypes(
  db: D1Database,
  activeOnly = true
): Promise<SessionType[]> {
  const query = activeOnly
    ? 'SELECT * FROM session_types WHERE is_active = 1 ORDER BY name'
    : 'SELECT * FROM session_types ORDER BY name';

  const result = await db.prepare(query).all<SessionType>();
  return result.results || [];
}
