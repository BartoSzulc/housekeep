export interface User {
  id: number;
  name: string;
  email: string;
  households?: Household[];
  created_at: string;
}

export interface Household {
  id: number;
  uuid: string;
  name: string;
  invite_code: string;
  members?: HouseholdMember[];
  created_at: string;
}

export interface HouseholdMember {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

export interface Location {
  id: number;
  uuid: string;
  name: string;
  icon: string | null;
  sort_order: number;
  products_count?: number;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  color: string | null;
  icon: string | null;
  products_count?: number;
}

export interface Product {
  id: number;
  uuid: string;
  household_id: number;
  location_id: number | null;
  category_id: number | null;
  created_by: number;
  name: string;
  description: string | null;
  price: string | null;
  quantity: number;
  min_quantity: number;
  expiry_date: string | null;
  is_reusable: boolean;
  restock_interval_days: number | null;
  last_restocked_at: string | null;
  barcode: string | null;
  image_url: string | null;
  nutriscore_grade: 'a' | 'b' | 'c' | 'd' | 'e' | null;
  allergens: string[];
  ingredients: string | null;
  on_shopping_list: boolean;
  consumed_at: string | null;
  is_expired: boolean;
  is_expiring_soon: boolean;
  is_low_stock: boolean;
  location?: Location;
  category?: Category;
  created_at: string;
  updated_at: string;
}

export interface PriceHistoryEntry {
  id: number;
  uuid: string;
  product_id: number;
  price: string;
  store: string | null;
  recorded_at: string;
}

export interface Task {
  id: number;
  uuid: string;
  household_id: number;
  created_by: number;
  assigned_to: number | null;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  is_recurring: boolean;
  rrule: string | null;
  priority: 0 | 1 | 2 | 3;
  is_completed: boolean;
  completed_at: string | null;
  reminder_minutes_before: number | null;
  assigned_user?: User;
  completions?: TaskCompletion[];
  created_at: string;
  updated_at: string;
}

export interface TaskCompletion {
  id: number;
  uuid: string;
  task_id: number;
  completed_by: number;
  occurrence_date: string;
  notes: string | null;
  user?: User;
}

export interface CalendarTask {
  task: Task;
  occurrence_date: string;
  is_completed: boolean;
}

export interface Invite {
  id: number;
  uuid: string;
  household_id: number;
  email: string | null;
  status: string;
  token: string;
  expires_at: string;
  invited_by?: User;
}
