/**
 * Database TypeScript Types
 * Auto-generated types matching Supabase schema
 *
 * To regenerate these types after schema changes:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Run: supabase gen types typescript --project-id ydhnhbcbiqmblfdmmywu > lib/types/database.types.ts
 *
 * Or manually update based on schema changes in migrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          message_count: number
          total_visits: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          message_count?: number
          total_visits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          message_count?: number
          total_visits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          recipient_id: string
          content: string
          sender_ip_hash: string
          is_read: boolean
          is_flagged: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          recipient_id: string
          content: string
          sender_ip_hash: string
          is_read?: boolean
          is_flagged?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          recipient_id?: string
          content?: string
          sender_ip_hash?: string
          is_read?: boolean
          is_flagged?: boolean
          created_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      message_analytics: {
        Row: {
          id: string
          user_id: string
          message_id: string | null
          event_type: 'message_received' | 'message_read' | 'message_flagged' | 'message_deleted' | 'profile_viewed' | 'link_shared'
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id?: string | null
          event_type: 'message_received' | 'message_read' | 'message_flagged' | 'message_deleted' | 'profile_viewed' | 'link_shared'
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string | null
          event_type?: 'message_received' | 'message_read' | 'message_flagged' | 'message_deleted' | 'profile_viewed' | 'link_shared'
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_analytics_message_id_fkey"
            columns: ["message_id"]
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
      link_visits: {
        Row: {
          id: string
          profile_id: string
          visitor_ip_hash: string
          referrer: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          visitor_ip_hash: string
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          visitor_ip_hash?: string
          referrer?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_visits_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      blocked_senders: {
        Row: {
          id: string
          user_id: string
          blocked_ip_hash: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blocked_ip_hash: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blocked_ip_hash?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_senders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table type exports
export type Profile = Tables<'profiles'>
export type ProfileInsert = Inserts<'profiles'>
export type ProfileUpdate = Updates<'profiles'>

export type Message = Tables<'messages'>
export type MessageInsert = Inserts<'messages'>
export type MessageUpdate = Updates<'messages'>

export type MessageAnalytic = Tables<'message_analytics'>
export type MessageAnalyticInsert = Inserts<'message_analytics'>
export type MessageAnalyticUpdate = Updates<'message_analytics'>

export type LinkVisit = Tables<'link_visits'>
export type LinkVisitInsert = Inserts<'link_visits'>
export type LinkVisitUpdate = Updates<'link_visits'>

export type BlockedSender = Tables<'blocked_senders'>
export type BlockedSenderInsert = Inserts<'blocked_senders'>
export type BlockedSenderUpdate = Updates<'blocked_senders'>

// Event types enum
export type AnalyticsEventType =
  | 'message_received'
  | 'message_read'
  | 'message_flagged'
  | 'message_deleted'
  | 'profile_viewed'
  | 'link_shared'

// Extended types with relationships
export type MessageWithRecipient = Message & {
  recipient: Profile
}

export type ProfileWithStats = Profile & {
  messages?: Message[]
  unread_count?: number
}
