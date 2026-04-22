// ── Enums ──
export type UserRole = 'super_admin' | 'admin' | 'editeur';
export type PropertyType = 'location' | 'location_meublee' | 'vente';
export type PropertyCategory = 'appartement' | 'terrain' | 'studio' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'villa' | 'bureau';
export type PropertyStatus = 'disponible' | 'loué' | 'vendu' | 'en_cours' | 'vefa';

// ── Models ──
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  path: string;
  url: string;
  is_main: boolean;
  sort_order: number;
}

export interface Property {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  status: PropertyStatus;
  price: number;
  surface: number;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  city: string;
  neighborhood: string | null;
  address: string | null;
  features: string[];
  is_visible: boolean;
  is_featured: boolean;
  images: PropertyImage[];
  main_image: PropertyImage | null;
  main_image_url: string | null;
  images_count?: number;
  creator: User | null;
  created_at: string;
  updated_at: string;
}

export interface Formation {
  id: number;
  title: string;
  slug: string;
  description: string;
  topics: string[];
  instructor: string;
  duration: string;
  format: string;
  level: string;
  price: number;
  date: string | null;
  image: string | null;
  image_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  creator: User | null;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  avatar_url: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NavigationItem {
  id: number;
  label: string;
  href: string;
  parent_id: number | null;
  sort_order: number;
  children: NavigationItem[];
}

export interface ContactSettings {
  id: number;
  phone: string;
  phone_secondary: string | null;
  email: string;
  email_secondary: string | null;
  address: string;
  city: string;
  country: string;
  whatsapp: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  hours_weekday: string | null;
  hours_weekend: string | null;
  google_maps_embed: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_properties: number;
  visible_properties: number;
  featured_properties: number;
  total_formations: number;
  published_blog_posts: number;
  unread_messages: number;
  total_users: number;
  recent_properties: Property[];
  recent_messages: ContactMessage[];
}

// ── API Responses ──
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiResponse<T> {
  data: T;
}
