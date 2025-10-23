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
        Relationships: []
      }
      lang: {
        Row: {
          created_at: string
          desc_lang: string | null
          id_lang: string
          id_prj: string
        }
        Insert: {
          created_at?: string
          desc_lang?: string | null
          id_lang: string
          id_prj: string
        }
        Update: {
          created_at?: string
          desc_lang?: string | null
          id_lang?: string
          id_prj?: string
        }
        Relationships: [
          {
            foreignKeyName: "lang_id_prj_fkey"
            columns: ["id_prj"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id_prj"]
          },
        ]
      }
      lob: {
        Row: {
          created_at: string | null
          desc_lob: string | null
          id_lang: string
          id_lob: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          desc_lob?: string | null
          id_lang: string
          id_lob: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          desc_lob?: string | null
          id_lang?: string
          id_lob?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lob_id_lang_fkey"
            columns: ["id_lang"]
            isOneToOne: false
            referencedRelation: "lang"
            referencedColumns: ["id_lang"]
          },
        ]
      }
      project: {
        Row: {
          created_at: string
          desc_prj: string | null
          id_prj: string
        }
        Insert: {
          created_at?: string
          desc_prj?: string | null
          id_prj: string
        }
        Update: {
          created_at?: string
          desc_prj?: string | null
          id_prj?: string
        }
        Relationships: []
      }
      simulation: {
        Row: {
          account_num: string | null
          calculation_type: string | null
          created_at: string | null
          formula: string | null
          id_lang: string | null
          id_lob: string | null
          id_proj: string
          id_sim: string
          id_sim_ver: string | null
          level: string | null
          month: number | null
          name: string
          parent_account_id: string | null
          row_index: number
          value: number | null
          value_orig: number | null
          value_type: string | null
          version_id: string | null
          year: number | null
        }
        Insert: {
          account_num?: string | null
          calculation_type?: string | null
          created_at?: string | null
          formula?: string | null
          id_lang?: string | null
          id_lob?: string | null
          id_proj: string
          id_sim?: string
          id_sim_ver?: string | null
          level?: string | null
          month?: number | null
          name: string
          parent_account_id?: string | null
          row_index: number
          value?: number | null
          value_orig?: number | null
          value_type?: string | null
          version_id?: string | null
          year?: number | null
        }
        Update: {
          account_num?: string | null
          calculation_type?: string | null
          created_at?: string | null
          formula?: string | null
          id_lang?: string | null
          id_lob?: string | null
          id_proj?: string
          id_sim?: string
          id_sim_ver?: string | null
          level?: string | null
          month?: number | null
          name?: string
          parent_account_id?: string | null
          row_index?: number
          value?: number | null
          value_orig?: number | null
          value_type?: string | null
          version_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_id_lob_fkey"
            columns: ["id_lob"]
            isOneToOne: false
            referencedRelation: "lob"
            referencedColumns: ["id_lob"]
          },
          {
            foreignKeyName: "simulation_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "simulation_versions"
            referencedColumns: ["id_sim_ver"]
          },
        ]
      }
      simulation_configs: {
        Row: {
          created_at: string | null
          description: string | null
          id_prj: string
          id_sim_cfg: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id_prj: string
          id_sim_cfg?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id_prj?: string
          id_sim_cfg?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_configs_id_prj_fkey"
            columns: ["id_prj"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id_prj"]
          },
        ]
      }
      simulation_configs_variables: {
        Row: {
          account_num: string
          blocked: boolean | null
          calculation_type: string | null
          created_at: string | null
          formula: string | null
          id_lang: string | null
          id_lob: string | null
          id_proj: string
          id_sim_cfg: string | null
          id_sim_cfg_var: string
          level: number
          name: string
          parent_account_id: string | null
          row_index: number
          value_type: string | null
        }
        Insert: {
          account_num: string
          blocked?: boolean | null
          calculation_type?: string | null
          created_at?: string | null
          formula?: string | null
          id_lang?: string | null
          id_lob?: string | null
          id_proj: string
          id_sim_cfg?: string | null
          id_sim_cfg_var?: string
          level?: number
          name: string
          parent_account_id?: string | null
          row_index?: number
          value_type?: string | null
        }
        Update: {
          account_num?: string
          blocked?: boolean | null
          calculation_type?: string | null
          created_at?: string | null
          formula?: string | null
          id_lang?: string | null
          id_lob?: string | null
          id_proj?: string
          id_sim_cfg?: string | null
          id_sim_cfg_var?: string
          level?: number
          name?: string
          parent_account_id?: string | null
          row_index?: number
          value_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_configs_variables_id_lang_fkey"
            columns: ["id_lang"]
            isOneToOne: false
            referencedRelation: "lang"
            referencedColumns: ["id_lang"]
          },
          {
            foreignKeyName: "simulation_configs_variables_id_lob_fkey"
            columns: ["id_lob"]
            isOneToOne: false
            referencedRelation: "lob"
            referencedColumns: ["id_lob"]
          },
          {
            foreignKeyName: "simulation_configs_variables_id_sim_cfg_fkey"
            columns: ["id_sim_cfg"]
            isOneToOne: false
            referencedRelation: "simulation_configs"
            referencedColumns: ["id_sim_cfg"]
          },
          {
            foreignKeyName: "simulation_configs_variables_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "simulation_configs_variables"
            referencedColumns: ["id_sim_cfg_var"]
          },
        ]
      }
      simulation_intake: {
        Row: {
          created_at: string | null
          id_intake: string
          id_lob: string | null
          month: number | null
          name: string
          row_index: number
          value: number | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id_intake?: string
          id_lob?: string | null
          month?: number | null
          name: string
          row_index: number
          value?: number | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id_intake?: string
          id_lob?: string | null
          month?: number | null
          name?: string
          row_index?: number
          value?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_intake_id_lob_fkey"
            columns: ["id_lob"]
            isOneToOne: false
            referencedRelation: "lob"
            referencedColumns: ["id_lob"]
          },
        ]
      }
      simulation_versions: {
        Row: {
          created_at: string | null
          data: Json | null
          id_prj: string | null
          id_sim_ver: string
          is_base: boolean | null
          name: string
          notes: string | null
          order_index: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id_prj?: string | null
          id_sim_ver?: string
          is_base?: boolean | null
          name: string
          notes?: string | null
          order_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id_prj?: string | null
          id_sim_ver?: string
          is_base?: boolean | null
          name?: string
          notes?: string | null
          order_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_versions_id_prj_fkey"
            columns: ["id_prj"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id_prj"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
