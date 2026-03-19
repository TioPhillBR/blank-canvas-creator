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
      banners: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      clock_records: {
        Row: {
          accuracy: number | null
          created_at: string
          date_time: string
          edited: boolean
          employee_id: string
          id: string
          latitude: number | null
          longitude: number | null
          type: Database["public"]["Enums"]["clock_event_type"]
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          date_time?: string
          edited?: boolean
          employee_id: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          type: Database["public"]["Enums"]["clock_event_type"]
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          date_time?: string
          edited?: boolean
          employee_id?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          type?: Database["public"]["Enums"]["clock_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "clock_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quotes: {
        Row: {
          author: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          quote: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          quote: string
        }
        Update: {
          author?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          quote?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          allergies: string[] | null
          birth_date: string | null
          blood_type: string
          cpf: string
          created_at: string
          department: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          full_name: string
          gender: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          medications: string[] | null
          phone: string
          photo_url: string | null
          pre_existing_conditions: string[] | null
          rg: string | null
          role: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          allergies?: string[] | null
          birth_date?: string | null
          blood_type: string
          cpf: string
          created_at?: string
          department: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          full_name: string
          gender?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          medications?: string[] | null
          phone: string
          photo_url?: string | null
          pre_existing_conditions?: string[] | null
          rg?: string | null
          role: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          allergies?: string[] | null
          birth_date?: string | null
          blood_type?: string
          cpf?: string
          created_at?: string
          department?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          full_name?: string
          gender?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          medications?: string[] | null
          phone?: string
          photo_url?: string | null
          pre_existing_conditions?: string[] | null
          rg?: string | null
          role?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      institutional_sections: {
        Row: {
          content: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          archived: boolean
          created_at: string
          date_time: string
          employee_id: string | null
          id: string
          image_url: string | null
          message: string
          read: boolean
          title: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          date_time?: string
          employee_id?: string | null
          id?: string
          image_url?: string | null
          message: string
          read?: boolean
          title: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          date_time?: string
          employee_id?: string | null
          id?: string
          image_url?: string | null
          message?: string
          read?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          description: string
          id: string
          is_active: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          description: string
          id?: string
          is_active?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string
          id?: string
          is_active?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          used_at?: string | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          employee_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          additional_notes: string | null
          created_at: string
          education: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string
          position_interest: string
          resume_url: string | null
          skills: string | null
          user_id: string
          wristband_code: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          education?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone: string
          position_interest: string
          resume_url?: string | null
          skills?: string | null
          user_id: string
          wristband_code?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          education?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string
          position_interest?: string
          resume_url?: string | null
          skills?: string | null
          user_id?: string
          wristband_code?: string | null
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
      work_schedules: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          end_time: string
          id: string
          shift: Database["public"]["Enums"]["shift_type"]
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          end_time: string
          id?: string
          shift: Database["public"]["Enums"]["shift_type"]
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          shift?: Database["public"]["Enums"]["shift_type"]
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      wristbands: {
        Row: {
          code: string
          created_at: string
          employee_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wristbands_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "employee" | "parceiro" | "user"
      clock_event_type: "entrada" | "saída" | "saída-almoço" | "retorno-almoço"
      shift_type: "Manhã" | "Tarde" | "Noite"
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
      app_role: ["admin", "employee", "parceiro", "user"],
      clock_event_type: ["entrada", "saída", "saída-almoço", "retorno-almoço"],
      shift_type: ["Manhã", "Tarde", "Noite"],
    },
  },
} as const
