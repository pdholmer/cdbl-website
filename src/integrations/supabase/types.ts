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
      divisions: {
        Row: {
          age_range: string
          cost: number | null
          created_at: string | null
          display_order: number | null
          features: Json | null
          id: string
          name: string
          program_id: string
          schedule_notes: string | null
          season_length: string | null
          updated_at: string | null
        }
        Insert: {
          age_range: string
          cost?: number | null
          created_at?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          name: string
          program_id: string
          schedule_notes?: string | null
          season_length?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string
          cost?: number | null
          created_at?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          name?: string
          program_id?: string
          schedule_notes?: string | null
          season_length?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "divisions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_divisions_program"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string | null
          display_order: number | null
          id: string
          program_id: string | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          program_id?: string | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          program_id?: string | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faqs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_faqs_program"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          age_at_registration: number | null
          allergies: string | null
          amount_due: number | null
          amount_paid: number | null
          assigned_date: string | null
          city: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string
          division_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string
          gender: string | null
          id: string
          jersey_number: string | null
          jersey_size: string | null
          last_name: string
          medical_notes: string | null
          parent_email: string
          parent_guardian_name: string
          parent_phone: string
          payment_date: string | null
          payment_method: string | null
          payment_notes: string | null
          payment_status: string | null
          previous_divisions_played: string | null
          previous_experience: boolean | null
          program_id: string | null
          registration_date: string | null
          skill_level: string | null
          special_requests: string | null
          state: string | null
          status: string | null
          team_id: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          age_at_registration?: number | null
          allergies?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          assigned_date?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth: string
          division_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name: string
          gender?: string | null
          id?: string
          jersey_number?: string | null
          jersey_size?: string | null
          last_name: string
          medical_notes?: string | null
          parent_email: string
          parent_guardian_name: string
          parent_phone: string
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          previous_divisions_played?: string | null
          previous_experience?: boolean | null
          program_id?: string | null
          registration_date?: string | null
          skill_level?: string | null
          special_requests?: string | null
          state?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          age_at_registration?: number | null
          allergies?: string | null
          amount_due?: number | null
          amount_paid?: number | null
          assigned_date?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string
          division_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          jersey_number?: string | null
          jersey_size?: string | null
          last_name?: string
          medical_notes?: string | null
          parent_email?: string
          parent_guardian_name?: string
          parent_phone?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_notes?: string | null
          payment_status?: string | null
          previous_divisions_played?: string | null
          previous_experience?: boolean | null
          program_id?: string | null
          registration_date?: string | null
          skill_level?: string | null
          special_requests?: string | null
          state?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          id: string
          name: string
          overview: string | null
          registration_open: boolean | null
          registration_url: string | null
          season_end: string | null
          season_start: string | null
          type: Database["public"]["Enums"]["program_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          overview?: string | null
          registration_open?: boolean | null
          registration_url?: string | null
          season_end?: string | null
          season_start?: string | null
          type: Database["public"]["Enums"]["program_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          overview?: string | null
          registration_open?: boolean | null
          registration_url?: string | null
          season_end?: string | null
          season_start?: string | null
          type?: Database["public"]["Enums"]["program_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      registration_submissions: {
        Row: {
          admin_notes: string | null
          birth_certificate_uploaded: boolean | null
          birth_certificate_url: string | null
          created_at: string | null
          form_data: Json | null
          id: string
          ip_address: string | null
          player_id: string | null
          program_id: string | null
          proof_of_residency_uploaded: boolean | null
          proof_of_residency_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
          user_agent: string | null
          waiver_date: string | null
          waiver_signature: string | null
          waiver_signed_by: string | null
          waivers_signed: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          birth_certificate_uploaded?: boolean | null
          birth_certificate_url?: string | null
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: string | null
          player_id?: string | null
          program_id?: string | null
          proof_of_residency_uploaded?: boolean | null
          proof_of_residency_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
          user_agent?: string | null
          waiver_date?: string | null
          waiver_signature?: string | null
          waiver_signed_by?: string | null
          waivers_signed?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          birth_certificate_uploaded?: boolean | null
          birth_certificate_url?: string | null
          created_at?: string | null
          form_data?: Json | null
          id?: string
          ip_address?: string | null
          player_id?: string | null
          program_id?: string | null
          proof_of_residency_uploaded?: boolean | null
          proof_of_residency_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
          user_agent?: string | null
          waiver_date?: string | null
          waiver_signature?: string | null
          waiver_signed_by?: string | null
          waivers_signed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_submissions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          age_group: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          age_group?: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          age_group?: string | null
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rules_policies: {
        Row: {
          additional_rules: Json | null
          applies_to_all: boolean | null
          batting_rules: string | null
          created_at: string | null
          division_id: string | null
          equipment_requirements: string | null
          game_length: string | null
          id: string
          pitching_rules: string | null
          safety_rules: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          additional_rules?: Json | null
          applies_to_all?: boolean | null
          batting_rules?: string | null
          created_at?: string | null
          division_id?: string | null
          equipment_requirements?: string | null
          game_length?: string | null
          id?: string
          pitching_rules?: string | null
          safety_rules?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          additional_rules?: Json | null
          applies_to_all?: boolean | null
          batting_rules?: string | null
          created_at?: string | null
          division_id?: string | null
          equipment_requirements?: string | null
          game_length?: string | null
          id?: string
          pitching_rules?: string | null
          safety_rules?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rules_division"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rules_policies_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          display_order: number
          id: string
          notes: string | null
          page: string
          section: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value: string
          created_at?: string
          display_order?: number
          id?: string
          notes?: string | null
          page: string
          section: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          display_order?: number
          id?: string
          notes?: string | null
          page?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_options: {
        Row: {
          active: boolean | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          tiers: Json | null
          title: string
          type: Database["public"]["Enums"]["support_type"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          tiers?: Json | null
          title: string
          type: Database["public"]["Enums"]["support_type"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          tiers?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["support_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      assign_first_user_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      program_type: "in_house" | "travel"
      resource_category:
        | "drill"
        | "practice_plan"
        | "safety_guide"
        | "administrative"
      support_type: "donation" | "sponsorship" | "volunteer" | "merchandise"
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
      program_type: ["in_house", "travel"],
      resource_category: [
        "drill",
        "practice_plan",
        "safety_guide",
        "administrative",
      ],
      support_type: ["donation", "sponsorship", "volunteer", "merchandise"],
    },
  },
} as const
