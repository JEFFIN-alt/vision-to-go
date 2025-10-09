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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      face_analysis_cache: {
        Row: {
          analysis_data: Json
          confidence_score: number | null
          created_at: string | null
          detected_age_range: string | null
          detected_emotion: string | null
          detected_gender: string | null
          id: string
          image_hash: string
          user_id: string
        }
        Insert: {
          analysis_data: Json
          confidence_score?: number | null
          created_at?: string | null
          detected_age_range?: string | null
          detected_emotion?: string | null
          detected_gender?: string | null
          id?: string
          image_hash: string
          user_id: string
        }
        Update: {
          analysis_data?: Json
          confidence_score?: number | null
          created_at?: string | null
          detected_age_range?: string | null
          detected_emotion?: string | null
          detected_gender?: string | null
          id?: string
          image_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      face_reports: {
        Row: {
          analysis_data: Json
          confidence_score: number | null
          created_at: string
          face_shape: string | null
          id: string
          skin_tone: string | null
          user_id: string
        }
        Insert: {
          analysis_data: Json
          confidence_score?: number | null
          created_at?: string
          face_shape?: string | null
          id?: string
          skin_tone?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json
          confidence_score?: number | null
          created_at?: string
          face_shape?: string | null
          id?: string
          skin_tone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          flag_key: string
          id: string
          is_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          flag_key: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          flag_key?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string
          rating: number | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          category: string
          created_at?: string
          id?: string
          message: string
          rating?: number | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          rating?: number | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jobs_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          job_name: string
          metadata: Json | null
          retry_count: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          metadata?: Json | null
          retry_count?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          metadata?: Json | null
          retry_count?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      product_clicks: {
        Row: {
          clicked_at: string
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string
          category: string
          click_count: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          affiliate_link: string
          category: string
          click_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          affiliate_link?: string
          category?: string
          click_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          analytics_enabled: boolean | null
          created_at: string
          email_updates: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          push_notifications: boolean | null
          save_transformations: boolean | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_enabled?: boolean | null
          created_at?: string
          email_updates?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          push_notifications?: boolean | null
          save_transformations?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_enabled?: boolean | null
          created_at?: string
          email_updates?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          push_notifications?: boolean | null
          save_transformations?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          quote_text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          quote_text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          quote_text?: string
        }
        Relationships: []
      }
      transformations: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_favorite: boolean | null
          original_image_url: string
          settings: Json | null
          style_name: string
          transformation_type: string
          transformed_image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          original_image_url: string
          settings?: Json | null
          style_name: string
          transformation_type: string
          transformed_image_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          original_image_url?: string
          settings?: Json | null
          style_name?: string
          transformation_type?: string
          transformed_image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      trending_styles: {
        Row: {
          category: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          source: string
          style_name: string
          trend_score: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          source: string
          style_name: string
          trend_score?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          source?: string
          style_name?: string
          trend_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_data_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          request_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_transformations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_trends: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
