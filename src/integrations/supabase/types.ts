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
      detail_indicators: {
        Row: {
          created_at: string | null
          display_order: number
          formula: string
          id: string
          name: string
          variable_id: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          formula: string
          id?: string
          name: string
          variable_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          formula?: string
          id?: string
          name?: string
          variable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detail_indicators_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "variables"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulation_configs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      simulation_configs_variables: {
        Row: {
          account_code: string
          calculation_type: string | null
          config_id: string
          created_at: string | null
          formula: string | null
          id: string
          name: string
          row_index: number
          value_type: string | null
        }
        Insert: {
          account_code: string
          calculation_type?: string | null
          config_id: string
          created_at?: string | null
          formula?: string | null
          id?: string
          name: string
          row_index?: number
          value_type?: string | null
        }
        Update: {
          account_code?: string
          calculation_type?: string | null
          config_id?: string
          created_at?: string | null
          formula?: string | null
          id?: string
          name?: string
          row_index?: number
          value_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_configs_variables_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "simulation_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_versions: {
        Row: {
          config_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_base: boolean | null
          name: string
          notes: string | null
          order_index: number | null
          program_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          config_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_base?: boolean | null
          name: string
          notes?: string | null
          order_index?: number | null
          program_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          config_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_base?: boolean | null
          name?: string
          notes?: string | null
          order_index?: number | null
          program_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_simulation_versions_program"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_versions_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "simulation_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      variables: {
        Row: {
          account_code: string
          apr: number | null
          aug: number | null
          calculation_type: string | null
          config_id: string
          created_at: string | null
          dec: number | null
          feb: number | null
          formula: string | null
          id: string
          jan: number | null
          jul: number | null
          jun: number | null
          mar: number | null
          may: number | null
          month_values: Json | null
          name: string
          nov: number | null
          oct: number | null
          row_index: number
          sep: number | null
          value_type: string | null
          version_id: string | null
        }
        Insert: {
          account_code: string
          apr?: number | null
          aug?: number | null
          calculation_type?: string | null
          config_id: string
          created_at?: string | null
          dec?: number | null
          feb?: number | null
          formula?: string | null
          id?: string
          jan?: number | null
          jul?: number | null
          jun?: number | null
          mar?: number | null
          may?: number | null
          month_values?: Json | null
          name: string
          nov?: number | null
          oct?: number | null
          row_index: number
          sep?: number | null
          value_type?: string | null
          version_id?: string | null
        }
        Update: {
          account_code?: string
          apr?: number | null
          aug?: number | null
          calculation_type?: string | null
          config_id?: string
          created_at?: string | null
          dec?: number | null
          feb?: number | null
          formula?: string | null
          id?: string
          jan?: number | null
          jul?: number | null
          jun?: number | null
          mar?: number | null
          may?: number | null
          month_values?: Json | null
          name?: string
          nov?: number | null
          oct?: number | null
          row_index?: number
          sep?: number | null
          value_type?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variables_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "simulation_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variables_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "simulation_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      variables_backup: {
        Row: {
          color_theme: string | null
          config_id: string | null
          created_at: string | null
          formula: string | null
          formula_description: string | null
          formula_display: string | null
          id: string | null
          is_editable: boolean | null
          name: string | null
          row_index: number | null
        }
        Insert: {
          color_theme?: string | null
          config_id?: string | null
          created_at?: string | null
          formula?: string | null
          formula_description?: string | null
          formula_display?: string | null
          id?: string | null
          is_editable?: boolean | null
          name?: string | null
          row_index?: number | null
        }
        Update: {
          color_theme?: string | null
          config_id?: string | null
          created_at?: string | null
          formula?: string | null
          formula_description?: string | null
          formula_display?: string | null
          id?: string | null
          is_editable?: boolean | null
          name?: string | null
          row_index?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_config: {
        Args: { config_id: string; user_id_check: string }
        Returns: boolean
      }
      user_owns_version: {
        Args: { user_id_check: string; version_id: string }
        Returns: boolean
      }
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
