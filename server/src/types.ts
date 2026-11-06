// ─── Contact ──────────────────────────────────────────

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'churned';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  avatarUrl: string;
  notes: string;
  createdAt: string;
}

// ─── Deal ─────────────────────────────────────────────

export type DealStage = 'new' | 'negotiation' | 'proposal' | 'closed-won' | 'closed-lost';

/** API response shape — does NOT include tasks. */
export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  description: string;
  contactId: string;
  public: boolean;
  createdAt: string;
}

/** Internal storage shape — includes embedded tasks. */
export interface DealRecord extends Deal {
  tasks: Task[];
}

export interface DealUpdateRequest {
  title?: string;
  value?: number;
  stage?: DealStage;
  description?: string;
  contactId?: string;
  public?: boolean;
}

// ─── Task ─────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface TaskCreateRequest {
  title: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface TaskUpdateRequest {
  title?: string;
  dueDate?: string;
  priority?: TaskPriority;
  completed?: boolean;
}

// ─── Auth ─────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Public user info returned by GET /auth/me. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Internal record with password for mock auth. */
export interface AuthUserRecord extends AuthUser {
  password: string;
}

// ─── Shared ───────────────────────────────────────────

export interface PagingObject<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  error: {
    status: number;
    message: string;
    code: string;
  };
}
