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
      coach_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          division_id: string | null
          email: string
          expires_at: string | null
          first_name: string
          id: string
          invited_by: string | null
          last_name: string
          phone: string | null
          program_id: string | null
          status: string | null
          team_id: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          division_id?: string | null
          email: string
          expires_at?: string | null
          first_name: string
          id?: string
          invited_by?: string | null
          last_name: string
          phone?: string | null
          program_id?: string | null
          status?: string | null
          team_id?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          division_id?: string | null
          email?: string
          expires_at?: string | null
          first_name?: string
          id?: string
          invited_by?: string | null
          last_name?: string
          phone?: string | null
          program_id?: string | null
          status?: string | null
          team_id?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_invitations_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invitations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          admin_notes: string | null
          background_check_date: string | null
          background_check_expiry: string | null
          background_check_status: string | null
          certifications: Json | null
          coaching_experience: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          background_check_date?: string | null
          background_check_expiry?: string | null
          background_check_status?: string | null
          certifications?: Json | null
          coaching_experience?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          background_check_date?: string | null
          background_check_expiry?: string | null
          background_check_status?: string | null
          certifications?: Json | null
          coaching_experience?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      commissioner_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          division_id: string | null
          id: string
          program_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          division_id?: string | null
          id?: string
          program_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          division_id?: string | null
          id?: string
          program_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissioner_assignments_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissioner_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_tasks: {
        Row: {
          assigned_to: string | null
          committee: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          priority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          committee: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          committee?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      concession_employees: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      concession_inventory: {
        Row: {
          category: string
          created_at: string
          current_quantity: number
          id: string
          is_active: boolean | null
          item_name: string
          last_restocked_at: string | null
          minimum_quantity: number
          notes: string | null
          sale_price: number | null
          unit_cost: number | null
          unit_type: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          category: string
          created_at?: string
          current_quantity?: number
          id?: string
          is_active?: boolean | null
          item_name: string
          last_restocked_at?: string | null
          minimum_quantity?: number
          notes?: string | null
          sale_price?: number | null
          unit_cost?: number | null
          unit_type?: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          current_quantity?: number
          id?: string
          is_active?: boolean | null
          item_name?: string
          last_restocked_at?: string | null
          minimum_quantity?: number
          notes?: string | null
          sale_price?: number | null
          unit_cost?: number | null
          unit_type?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      concession_shifts: {
        Row: {
          created_at: string
          employee_id: string | null
          end_time: string
          id: string
          notes: string | null
          shift_date: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          shift_date: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          shift_date?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concession_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "concession_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
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
      draft_picks: {
        Row: {
          created_at: string | null
          draft_id: string
          draft_team_id: string
          id: string
          is_auto_pick: boolean | null
          pick_in_round: number
          pick_number: number
          picked_at: string | null
          player_id: string
          round_number: number
          time_spent: number | null
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          draft_team_id: string
          id?: string
          is_auto_pick?: boolean | null
          pick_in_round: number
          pick_number: number
          picked_at?: string | null
          player_id: string
          round_number: number
          time_spent?: number | null
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          draft_team_id?: string
          id?: string
          is_auto_pick?: boolean | null
          pick_in_round?: number
          pick_number?: number
          picked_at?: string | null
          player_id?: string
          round_number?: number
          time_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_draft_team_id_fkey"
            columns: ["draft_team_id"]
            isOneToOne: false
            referencedRelation: "draft_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_player_pool: {
        Row: {
          created_at: string | null
          draft_id: string
          draft_notes: string | null
          id: string
          is_available: boolean | null
          player_id: string
          skill_rating: number | null
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          draft_notes?: string | null
          id?: string
          is_available?: boolean | null
          player_id: string
          skill_rating?: number | null
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          draft_notes?: string | null
          id?: string
          is_available?: boolean | null
          player_id?: string
          skill_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_player_pool_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_player_pool_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_player_queues: {
        Row: {
          created_at: string | null
          draft_team_id: string
          id: string
          player_id: string
          queue_order: number
        }
        Insert: {
          created_at?: string | null
          draft_team_id: string
          id?: string
          player_id: string
          queue_order: number
        }
        Update: {
          created_at?: string | null
          draft_team_id?: string
          id?: string
          player_id?: string
          queue_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "draft_player_queues_draft_team_id_fkey"
            columns: ["draft_team_id"]
            isOneToOne: false
            referencedRelation: "draft_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_player_queues_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_teams: {
        Row: {
          auto_pick_enabled: boolean | null
          coach_user_id: string | null
          created_at: string | null
          draft_id: string
          draft_order: number
          id: string
          is_ready: boolean | null
          team_id: string
        }
        Insert: {
          auto_pick_enabled?: boolean | null
          coach_user_id?: string | null
          created_at?: string | null
          draft_id: string
          draft_order: number
          id?: string
          is_ready?: boolean | null
          team_id: string
        }
        Update: {
          auto_pick_enabled?: boolean | null
          coach_user_id?: string | null
          created_at?: string | null
          draft_id?: string
          draft_order?: number
          id?: string
          is_ready?: boolean | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_teams_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      drafts: {
        Row: {
          actual_start: string | null
          auto_pick_enabled: boolean | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_pick: number | null
          current_round: number | null
          division_id: string | null
          draft_type: string | null
          id: string
          name: string
          pick_time_limit: number | null
          program_id: string | null
          scheduled_start: string | null
          season_year: number
          status: string | null
          total_rounds: number | null
          updated_at: string | null
        }
        Insert: {
          actual_start?: string | null
          auto_pick_enabled?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_pick?: number | null
          current_round?: number | null
          division_id?: string | null
          draft_type?: string | null
          id?: string
          name: string
          pick_time_limit?: number | null
          program_id?: string | null
          scheduled_start?: string | null
          season_year: number
          status?: string | null
          total_rounds?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_start?: string | null
          auto_pick_enabled?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_pick?: number | null
          current_round?: number | null
          division_id?: string | null
          draft_type?: string | null
          id?: string
          name?: string
          pick_time_limit?: number | null
          program_id?: string | null
          scheduled_start?: string | null
          season_year?: number
          status?: string | null
          total_rounds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drafts_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drafts_program_id_fkey"
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
      games: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          cancellation_reason: string | null
          created_at: string | null
          created_by: string | null
          division_id: string | null
          estimated_duration: number | null
          field_number: string | null
          game_date: string
          game_time: string
          game_type: string
          gamechanger_game_id: string | null
          gamechanger_url: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          last_synced_at: string | null
          notes: string | null
          notifications_sent: boolean | null
          reminder_1h_sent: boolean | null
          reminder_24h_sent: boolean | null
          rescheduled_from_date: string | null
          rescheduled_from_time: string | null
          status: string | null
          umpire_contact: string | null
          umpire_fee: number | null
          umpire_name: string | null
          updated_at: string | null
          venue_id: string | null
          weather_status: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          division_id?: string | null
          estimated_duration?: number | null
          field_number?: string | null
          game_date: string
          game_time: string
          game_type: string
          gamechanger_game_id?: string | null
          gamechanger_url?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          notifications_sent?: boolean | null
          reminder_1h_sent?: boolean | null
          reminder_24h_sent?: boolean | null
          rescheduled_from_date?: string | null
          rescheduled_from_time?: string | null
          status?: string | null
          umpire_contact?: string | null
          umpire_fee?: number | null
          umpire_name?: string | null
          updated_at?: string | null
          venue_id?: string | null
          weather_status?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          division_id?: string | null
          estimated_duration?: number | null
          field_number?: string | null
          game_date?: string
          game_time?: string
          game_type?: string
          gamechanger_game_id?: string | null
          gamechanger_url?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          last_synced_at?: string | null
          notes?: string | null
          notifications_sent?: boolean | null
          reminder_1h_sent?: boolean | null
          reminder_24h_sent?: boolean | null
          rescheduled_from_date?: string | null
          rescheduled_from_time?: string | null
          status?: string | null
          umpire_contact?: string | null
          umpire_fee?: number | null
          umpire_name?: string | null
          updated_at?: string | null
          venue_id?: string | null
          weather_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_events: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          active: boolean | null
          body: string
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          body: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          body?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      messages_sent: {
        Row: {
          body: string
          created_at: string | null
          delivered_count: number | null
          delivery_method: string | null
          error_message: string | null
          failed_count: number | null
          id: string
          opened_count: number | null
          recipient_emails: Json | null
          recipient_ids: Json | null
          recipient_type: string
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string
          template_id: string | null
          total_recipients: number | null
        }
        Insert: {
          body: string
          created_at?: string | null
          delivered_count?: number | null
          delivery_method?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          opened_count?: number | null
          recipient_emails?: Json | null
          recipient_ids?: Json | null
          recipient_type: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
          total_recipients?: number | null
        }
        Update: {
          body?: string
          created_at?: string | null
          delivered_count?: number | null
          delivery_method?: string | null
          error_message?: string | null
          failed_count?: number | null
          id?: string
          opened_count?: number | null
          recipient_emails?: Json | null
          recipient_ids?: Json | null
          recipient_type?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          total_recipients?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sent_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_configs: {
        Row: {
          active: boolean | null
          created_at: string | null
          event_type: string
          id: string
          name: string
          template_id: string | null
          timing_offset_hours: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          event_type: string
          id?: string
          name: string
          template_id?: string | null
          timing_offset_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          event_type?: string
          id?: string
          name?: string
          template_id?: string | null
          timing_offset_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_configs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visibility: {
        Row: {
          hidden_at: string | null
          hidden_by: string | null
          hidden_message: string | null
          id: string
          is_visible: boolean
          page_label: string
          page_slug: string
          updated_at: string
        }
        Insert: {
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_message?: string | null
          id?: string
          is_visible?: boolean
          page_label: string
          page_slug: string
          updated_at?: string
        }
        Update: {
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_message?: string | null
          id?: string
          is_visible?: boolean
          page_label?: string
          page_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          feature_module: string | null
          feedback_type: string
          id: string
          priority: string | null
          prompt_generated_at: string | null
          rating: number | null
          recommended_prompt: string | null
          screenshot_url: string | null
          source_module: string | null
          source_page: string | null
          status: string
          subject: string
          submitter_email: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          feature_module?: string | null
          feedback_type: string
          id?: string
          priority?: string | null
          prompt_generated_at?: string | null
          rating?: number | null
          recommended_prompt?: string | null
          screenshot_url?: string | null
          source_module?: string | null
          source_page?: string | null
          status?: string
          subject: string
          submitter_email?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          feature_module?: string | null
          feedback_type?: string
          id?: string
          priority?: string | null
          prompt_generated_at?: string | null
          rating?: number | null
          recommended_prompt?: string | null
          screenshot_url?: string | null
          source_module?: string | null
          source_page?: string | null
          status?: string
          subject?: string
          submitter_email?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      player_data_access_log: {
        Row: {
          access_type: string
          accessed_by: string
          accessed_by_email: string
          accessed_fields: Json | null
          created_at: string
          id: string
          ip_address: string | null
          player_id: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by: string
          accessed_by_email: string
          accessed_fields?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          player_id: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by?: string
          accessed_by_email?: string
          accessed_fields?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          player_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_data_access_log_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_guardians: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_primary: boolean | null
          last_name: string
          phone: string
          player_id: string
          relationship: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_primary?: boolean | null
          last_name: string
          phone: string
          player_id: string
          relationship?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_primary?: boolean | null
          last_name?: string
          phone?: string
          player_id?: string
          relationship?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_guardians_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
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
          parent_first_name: string
          parent_guardian_name: string
          parent_last_name: string
          parent_phone: string
          parent_relationship: string | null
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
          team_name: string | null
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
          parent_first_name: string
          parent_guardian_name: string
          parent_last_name: string
          parent_phone: string
          parent_relationship?: string | null
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
          team_name?: string | null
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
          parent_first_name?: string
          parent_guardian_name?: string
          parent_last_name?: string
          parent_phone?: string
          parent_relationship?: string | null
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
          team_name?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_players_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
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
      practices: {
        Row: {
          attendance_count: number | null
          attendance_notes: string | null
          cancellation_reason: string | null
          created_at: string | null
          end_time: string
          field_number: string | null
          id: string
          notes: string | null
          practice_date: string
          practice_type: string | null
          start_time: string
          status: string | null
          team_id: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          attendance_count?: number | null
          attendance_notes?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          end_time: string
          field_number?: string | null
          id?: string
          notes?: string | null
          practice_date: string
          practice_type?: string | null
          start_time: string
          status?: string | null
          team_id: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          attendance_count?: number | null
          attendance_notes?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          end_time?: string
          field_number?: string | null
          id?: string
          notes?: string | null
          practice_date?: string
          practice_type?: string | null
          start_time?: string
          status?: string | null
          team_id?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practices_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practices_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          last_sign_in_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          last_sign_in_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          last_sign_in_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
      registration_code_uses: {
        Row: {
          code_id: string
          discount_applied: number | null
          final_amount: number | null
          id: string
          original_amount: number | null
          player_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          code_id: string
          discount_applied?: number | null
          final_amount?: number | null
          id?: string
          original_amount?: number | null
          player_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          code_id?: string
          discount_applied?: number | null
          final_amount?: number | null
          id?: string
          original_amount?: number | null
          player_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_code_uses_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "registration_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_code_uses_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          division_id: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          program_id: string | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type: string
          discount_value?: number
          division_id?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          program_id?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          division_id?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          program_id?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_codes_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_codes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      role_requests: {
        Row: {
          id: string
          reason: string | null
          requested_at: string
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          reason?: string | null
          requested_at?: string
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          reason?: string | null
          requested_at?: string
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          user_id?: string
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
      team_coaches: {
        Row: {
          assigned_date: string | null
          coach_id: string
          id: string
          primary_contact: boolean | null
          removed_date: string | null
          role: string
          status: string | null
          team_id: string
        }
        Insert: {
          assigned_date?: string | null
          coach_id: string
          id?: string
          primary_contact?: boolean | null
          removed_date?: string | null
          role: string
          status?: string | null
          team_id: string
        }
        Update: {
          assigned_date?: string | null
          coach_id?: string
          id?: string
          primary_contact?: boolean | null
          removed_date?: string | null
          role?: string
          status?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_important_dates: {
        Row: {
          created_at: string
          date_type: string
          date_value: string
          description: string | null
          id: string
          is_recurring: boolean | null
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_type?: string
          date_value: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_type?: string
          date_value?: string
          description?: string | null
          id?: string
          is_recurring?: boolean | null
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_important_dates_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_rosters: {
        Row: {
          created_at: string | null
          id: string
          jersey_number: string | null
          joined_date: string | null
          player_id: string
          position_primary: string | null
          position_secondary: string | null
          removal_reason: string | null
          removed_date: string | null
          season_year: number
          status: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jersey_number?: string | null
          joined_date?: string | null
          player_id: string
          position_primary?: string | null
          position_secondary?: string | null
          removal_reason?: string | null
          removed_date?: string | null
          season_year: number
          status?: string | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jersey_number?: string | null
          joined_date?: string | null
          player_id?: string
          position_primary?: string | null
          position_secondary?: string | null
          removal_reason?: string | null
          removed_date?: string | null
          season_year?: number
          status?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_rosters_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_rosters_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string
          task_type: string
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          task_type?: string
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string
          task_type?: string
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color_primary: string | null
          color_secondary: string | null
          created_at: string | null
          current_roster_count: number | null
          division_id: string
          gamechanger_team_id: string | null
          id: string
          last_synced_at: string | null
          logo_url: string | null
          max_roster_size: number | null
          name: string
          nickname: string | null
          program_id: string
          season_year: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          current_roster_count?: number | null
          division_id: string
          gamechanger_team_id?: string | null
          id?: string
          last_synced_at?: string | null
          logo_url?: string | null
          max_roster_size?: number | null
          name: string
          nickname?: string | null
          program_id: string
          season_year: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          color_primary?: string | null
          color_secondary?: string | null
          created_at?: string | null
          current_roster_count?: number | null
          division_id?: string
          gamechanger_team_id?: string | null
          id?: string
          last_synced_at?: string | null
          logo_url?: string | null
          max_roster_size?: number | null
          name?: string
          nickname?: string | null
          program_id?: string
          season_year?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      venue_fields: {
        Row: {
          created_at: string | null
          divisions: string[] | null
          field_name: string | null
          field_number: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          divisions?: string[] | null
          field_name?: string | null
          field_number: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          divisions?: string[] | null
          field_name?: string | null
          field_number?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_fields_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          available_days: Json | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          directions: string | null
          field_count: number | null
          has_concessions: boolean | null
          has_lights: boolean | null
          has_restrooms: boolean | null
          id: string
          name: string
          parking_info: string | null
          season_end: string | null
          season_start: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          available_days?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          directions?: string | null
          field_count?: number | null
          has_concessions?: boolean | null
          has_lights?: boolean | null
          has_restrooms?: boolean | null
          id?: string
          name: string
          parking_info?: string | null
          season_end?: string | null
          season_start?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          available_days?: Json | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          directions?: string | null
          field_count?: number | null
          has_concessions?: boolean | null
          has_lights?: boolean | null
          has_restrooms?: boolean | null
          id?: string
          name?: string
          parking_info?: string | null
          season_end?: string | null
          season_start?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      volunteer_signups: {
        Row: {
          created_at: string
          email: string
          experience: string | null
          id: string
          interest_areas: string[]
          name: string
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          experience?: string | null
          id?: string
          interest_areas?: string[]
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          experience?: string | null
          id?: string
          interest_areas?: string[]
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_role_request: {
        Args: { notes?: string; request_id: string }
        Returns: boolean
      }
      assign_first_user_admin: { Args: { _user_id: string }; Returns: boolean }
      check_schedule_conflict: {
        Args: {
          p_date: string
          p_end_time: string
          p_exclude_game_id?: string
          p_exclude_practice_id?: string
          p_start_time: string
          p_venue_id: string
        }
        Returns: boolean
      }
      get_current_pick_team: { Args: { draft_id: string }; Returns: string }
      get_user_email: { Args: never; Returns: string }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_commissioner_for: {
        Args: { _division_id?: string; _program_id: string; _user_id: string }
        Returns: boolean
      }
      log_player_access: {
        Args: {
          _access_type: string
          _accessed_fields?: Json
          _player_id: string
        }
        Returns: undefined
      }
      redeem_registration_code: {
        Args: {
          _code_id: string
          _discount_applied?: number
          _final_amount?: number
          _original_amount?: number
          _player_id?: string
        }
        Returns: boolean
      }
      reject_role_request: {
        Args: { notes?: string; request_id: string }
        Returns: boolean
      }
      validate_registration_code: {
        Args: { _code: string; _division_id?: string; _program_id?: string }
        Returns: {
          code_id: string
          discount_type: string
          discount_value: number
          error_message: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "coach"
        | "commissioner"
        | "board_member"
        | "parent"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "coach",
        "commissioner",
        "board_member",
        "parent",
      ],
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
