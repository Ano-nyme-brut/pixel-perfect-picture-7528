export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          deposit_amount: number
          full_name: string
          id: string
          instagram_handle: string | null
          is_active: boolean
          payout_iban_hint: string | null
          slug: string
          stripe_account_id: string | null
          styles: string[]
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          deposit_amount?: number
          full_name?: string
          id?: string
          instagram_handle?: string | null
          is_active?: boolean
          payout_iban_hint?: string | null
          slug: string
          stripe_account_id?: string | null
          styles?: string[]
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          deposit_amount?: number
          full_name?: string
          id?: string
          instagram_handle?: string | null
          is_active?: boolean
          payout_iban_hint?: string | null
          slug?: string
          stripe_account_id?: string | null
          styles?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          approx_size: string
          artist_id: string
          body_zone: string
          client_email: string
          client_instagram: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          decline_reason: string | null
          deposit_amount: number
          deposit_status: string
          description: string | null
          flash_id: string | null
          id: string
          preferred_date: string | null
          preferred_days: string[]
          preferred_time_slot: string | null
          project_type: string
          reference_code: string | null
          reference_images: string[]
          status: string
        }
        Insert: {
          approx_size: string
          artist_id: string
          body_zone: string
          client_email: string
          client_instagram?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          decline_reason?: string | null
          deposit_amount?: number
          deposit_status?: string
          description?: string | null
          flash_id?: string | null
          id?: string
          preferred_date?: string | null
          preferred_days?: string[]
          preferred_time_slot?: string | null
          project_type: string
          reference_code?: string | null
          reference_images?: string[]
          status?: string
        }
        Update: {
          approx_size?: string
          artist_id?: string
          body_zone?: string
          client_email?: string
          client_instagram?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          decline_reason?: string | null
          deposit_amount?: number
          deposit_status?: string
          description?: string | null
          flash_id?: string | null
          id?: string
          preferred_date?: string | null
          preferred_days?: string[]
          preferred_time_slot?: string | null
          project_type?: string
          reference_code?: string | null
          reference_images?: string[]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_flash_id_fkey"
            columns: ["flash_id"]
            isOneToOne: false
            referencedRelation: "flashes"
            referencedColumns: ["id"]
          },
        ]
      }
      flashes: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          image_url: string
          is_available: boolean
          price: number
          size: string | null
          title: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          image_url: string
          is_available?: boolean
          price?: number
          size?: string | null
          title: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          image_url?: string
          is_available?: boolean
          price?: number
          size?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashes_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_active_artist: { Args: { _artist_id: string }; Returns: boolean }
      owns_artist: { Args: { _artist_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
