export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      package: {
        Row: {
          package_id: string
          name: string
          description: string | null
          category: Database["public"]["Enums"]["package_category"]
          user_id: string
          keywords: string[]
          fts: unknown | null
          sys_keywords: string[]
        }
        Insert: {
          package_id: string
          name: string
          description?: string | null
          category: Database["public"]["Enums"]["package_category"]
          user_id?: string
          keywords?: string[]
          fts?: unknown | null
          sys_keywords?: string[]
        }
        Update: {
          package_id?: string
          name?: string
          description?: string | null
          category?: Database["public"]["Enums"]["package_category"]
          user_id?: string
          keywords?: string[]
          fts?: unknown | null
          sys_keywords?: string[]
        }
      }
      package_details: {
        Row: {
          package_id: string
          last_updated: string
          like_count: number
          rating_count: number
          rating_sum: number
        }
        Insert: {
          package_id: string
          last_updated?: string
          like_count?: number
          rating_count?: number
          rating_sum?: number
        }
        Update: {
          package_id?: string
          last_updated?: string
          like_count?: number
          rating_count?: number
          rating_sum?: number
        }
      }
      package_like: {
        Row: {
          package_id: string
          user_id: string
          date: string
        }
        Insert: {
          package_id: string
          user_id: string
          date?: string
        }
        Update: {
          package_id?: string
          user_id?: string
          date?: string
        }
      }
      package_rating: {
        Row: {
          package_id: string
          user_id: string
          rating: number
          last_updated: string
        }
        Insert: {
          package_id: string
          user_id: string
          rating?: number
          last_updated?: string
        }
        Update: {
          package_id?: string
          user_id?: string
          rating?: number
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      package_category:
        | "authentication"
        | "storage"
        | "hardware"
        | "communication"
        | "sdkintegration"
        | "analytics"
        | "platform"
        | "behavior"
        | "security"
    }
  }
}
