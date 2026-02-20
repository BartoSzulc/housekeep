import { CalendarTask, Category, Household, Invite, Location, PriceHistoryEntry, Product, Task, TaskCompletion, User, HouseholdMember } from './models';

// Auth
export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Household
export interface HouseholdResponse {
  household: Household;
}

// Products
export interface ProductListResponse {
  products: Product[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface ProductResponse {
  product: Product;
}

export interface StoreProductPayload {
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
  min_quantity?: number;
  location_id?: number;
  category_id?: number;
  expiry_date?: string;
  is_reusable?: boolean;
  restock_interval_days?: number;
  barcode?: string;
}

// Tasks
export interface TaskListResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}

export interface StoreTaskPayload {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  assigned_to?: number;
  is_recurring?: boolean;
  rrule?: string;
  priority?: number;
  reminder_minutes_before?: number;
}

export interface CalendarResponse {
  calendar: CalendarTask[];
  year: number;
  month: number;
}

// Sync
export interface SyncPullResponse {
  products: Product[];
  tasks: Task[];
  task_completions: TaskCompletion[];
  locations: Location[];
  categories: Category[];
  members: HouseholdMember[];
  server_time: string;
}
