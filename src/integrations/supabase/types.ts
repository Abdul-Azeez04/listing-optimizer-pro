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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      email_sequences: {
        Row: {
          created_at: string | null
          emails: Json
          id: string
          product_name: string
          sequence_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emails: Json
          id?: string
          product_name: string
          sequence_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emails?: Json
          id?: string
          product_name?: string
          sequence_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reported_result: string | null
          rewrite_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reported_result?: string | null
          rewrite_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reported_result?: string | null
          rewrite_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_rewrite_id_fkey"
            columns: ["rewrite_id"]
            isOneToOne: false
            referencedRelation: "rewrites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_cache: {
        Row: {
          cache_key: string
          category: string | null
          created_at: string | null
          data: Json
          expires_at: string | null
          id: string
          source: string | null
        }
        Insert: {
          cache_key: string
          category?: string | null
          created_at?: string | null
          data: Json
          expires_at?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          cache_key?: string
          category?: string | null
          created_at?: string | null
          data?: Json
          expires_at?: string | null
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          brand_voice: string | null
          brand_voice_trained_at: string | null
          brand_voice_traits: Json | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          primary_platform: string | null
          product_category: string | null
          target_buyer: string | null
          total_rewrites: number
        }
        Insert: {
          brand_voice?: string | null
          brand_voice_trained_at?: string | null
          brand_voice_traits?: Json | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          primary_platform?: string | null
          product_category?: string | null
          target_buyer?: string | null
          total_rewrites?: number
        }
        Update: {
          brand_voice?: string | null
          brand_voice_trained_at?: string | null
          brand_voice_traits?: Json | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          primary_platform?: string | null
          product_category?: string | null
          target_buyer?: string | null
          total_rewrites?: number
        }
        Relationships: []
      }
      rewrites: {
        Row: {
          category: string
          created_at: string
          id: string
          original_description: string
          original_score: number | null
          original_title: string
          platform: string
          selected_variant: number | null
          share_token: string | null
          share_views: number | null
          target_buyer: string
          user_id: string
          variants: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          original_description: string
          original_score?: number | null
          original_title: string
          platform: string
          selected_variant?: number | null
          share_token?: string | null
          share_views?: number | null
          target_buyer: string
          user_id: string
          variants: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          original_description?: string
          original_score?: number | null
          original_title?: string
          platform?: string
          selected_variant?: number | null
          share_token?: string | null
          share_views?: number | null
          target_buyer?: string
          user_id?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "rewrites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_captions: {
        Row: {
          captions: Json
          created_at: string | null
          id: string
          product_description: string
          product_name: string
          user_id: string
        }
        Insert: {
          captions: Json
          created_at?: string | null
          id?: string
          product_description: string
          product_name: string
          user_id: string
        }
        Update: {
          captions?: Json
          created_at?: string | null
          id?: string
          product_description?: string
          product_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_captions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_outputs: {
        Row: {
          created_at: string | null
          id: string
          input_data: Json
          output_data: Json
          tool_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          input_data: Json
          output_data: Json
          tool_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          input_data?: Json
          output_data?: Json
          tool_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_outputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_share_views: { Args: { token: string }; Returns: undefined }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
