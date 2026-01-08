// Phase 2 TypeScript types for new tables
// These types support groups, workout tracking, session types, and credit purchases

export interface Group {
  id: string;
  name: string;
  description: string | null;
  is_active: number;
  created_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  client_id: number;
  start_date: string;
  end_date: string | null;
  created_by: number;
  created_at: string;
}

export interface WorkoutAssignment {
  id: string;
  workout_id: string;
  assignee_type: 'group' | 'client';
  assignee_id: string;
  start_date: string;
  end_date: string | null;
  created_by: number;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  client_id: number;
  workout_id: string;
  assignment_id: string | null;
  performed_at: string;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSetLog {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  rest_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export interface SessionType {
  id: string;
  name: string;
  credits_cost: number;
  duration_minutes: number;
  is_active: number;
  created_at: string;
}

export interface CreditPurchase {
  id: string;
  client_id: number;
  provider: string;
  provider_txn_id: string;
  dollars_amount: number;
  credits_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchased_at: string;
  created_at: string;
}
