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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string
          id: string
          is_correct: boolean | null
          marked_review: boolean
          question_id: string
          selected_index: number | null
          time_spent_s: number
          updated_at: string
        }
        Insert: {
          attempt_id: string
          id?: string
          is_correct?: boolean | null
          marked_review?: boolean
          question_id: string
          selected_index?: number | null
          time_spent_s?: number
          updated_at?: string
        }
        Update: {
          attempt_id?: string
          id?: string
          is_correct?: boolean | null
          marked_review?: boolean
          question_id?: string
          selected_index?: number | null
          time_spent_s?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "test_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          bio: string | null
          created_at: string
          exam_cleared: string | null
          id: string
          institution: string | null
          is_active: boolean
          name: string
          price_per_session: number
          rank_achieved: string | null
          rating: number
          sessions_count: number
          specialisation_tags: string[]
        }
        Insert: {
          bio?: string | null
          created_at?: string
          exam_cleared?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean
          name: string
          price_per_session?: number
          rank_achieved?: string | null
          rating?: number
          sessions_count?: number
          specialisation_tags?: string[]
        }
        Update: {
          bio?: string | null
          created_at?: string
          exam_cleared?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean
          name?: string
          price_per_session?: number
          rank_achieved?: string | null
          rating?: number
          sessions_count?: number
          specialisation_tags?: string[]
        }
        Relationships: []
      }
      mock_tests: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          duration_minutes: number
          exam_name: string
          id: string
          num_questions: number
          questions: Json
          subject: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          exam_name: string
          id?: string
          num_questions?: number
          questions?: Json
          subject?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration_minutes?: number
          exam_name?: string
          id?: string
          num_questions?: number
          questions?: Json
          subject?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          first_name: string | null
          full_name: string | null
          id: string
          merit_points: number
          mobile: string | null
          onboarding_complete: boolean
          plan: string
          state: string | null
          study_hours_per_day: number | null
          target_exam: string
          target_year: number | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          merit_points?: number
          mobile?: string | null
          onboarding_complete?: boolean
          plan?: string
          state?: string | null
          study_hours_per_day?: number | null
          target_exam?: string
          target_year?: number | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          merit_points?: number
          mobile?: string | null
          onboarding_complete?: boolean
          plan?: string
          state?: string | null
          study_hours_per_day?: number | null
          target_exam?: string
          target_year?: number | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          approved: boolean
          correct_index: number
          created_at: string
          difficulty: string
          exam_id: string
          explanation: string | null
          id: string
          options: Json
          source: string
          stem: string
          subject_id: string | null
          topic_id: string | null
        }
        Insert: {
          approved?: boolean
          correct_index: number
          created_at?: string
          difficulty?: string
          exam_id: string
          explanation?: string | null
          id?: string
          options: Json
          source?: string
          stem: string
          subject_id?: string | null
          topic_id?: string | null
        }
        Update: {
          approved?: boolean
          correct_index?: number
          created_at?: string
          difficulty?: string
          exam_id?: string
          explanation?: string | null
          id?: string
          options?: Json
          source?: string
          stem?: string
          subject_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_topics: {
        Row: {
          created_at: string
          exam_name: string
          id: string
          subject: string
          topic_name: string
        }
        Insert: {
          created_at?: string
          exam_name: string
          id?: string
          subject: string
          topic_name: string
        }
        Update: {
          created_at?: string
          exam_name?: string
          id?: string
          subject?: string
          topic_name?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          exam_id: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          exam_id: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          exam_id?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          answers: Json | null
          answers_json: Json | null
          correct_count: number | null
          id: string
          mock_test_id: string | null
          percentage: number | null
          percentile: number | null
          score: number | null
          started_at: string
          submitted_at: string | null
          test_id: string | null
          total_marks: number | null
          unattempted_count: number | null
          user_id: string
          weak_topics: string[]
          wrong_count: number | null
        }
        Insert: {
          answers?: Json | null
          answers_json?: Json | null
          correct_count?: number | null
          id?: string
          mock_test_id?: string | null
          percentage?: number | null
          percentile?: number | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          test_id?: string | null
          total_marks?: number | null
          unattempted_count?: number | null
          user_id: string
          weak_topics?: string[]
          wrong_count?: number | null
        }
        Update: {
          answers?: Json | null
          answers_json?: Json | null
          correct_count?: number | null
          id?: string
          mock_test_id?: string | null
          percentage?: number | null
          percentile?: number | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          test_id?: string | null
          total_marks?: number | null
          unattempted_count?: number | null
          user_id?: string
          weak_topics?: string[]
          wrong_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_mock_test_id_fkey"
            columns: ["mock_test_id"]
            isOneToOne: false
            referencedRelation: "mock_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_questions: {
        Row: {
          id: string
          position: number
          question_id: string
          test_id: string
        }
        Insert: {
          id?: string
          position: number
          question_id: string
          test_id: string
        }
        Update: {
          id?: string
          position?: number
          question_id?: string
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          description: string | null
          duration_min: number
          exam_id: string
          id: string
          is_published: boolean
          marks_per_correct: number
          marks_per_wrong: number
          test_type: string
          title: string
          total_questions: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_min: number
          exam_id: string
          id?: string
          is_published?: boolean
          marks_per_correct?: number
          marks_per_wrong?: number
          test_type: string
          title: string
          total_questions: number
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_min?: number
          exam_id?: string
          id?: string
          is_published?: boolean
          marks_per_correct?: number
          marks_per_wrong?: number
          test_type?: string
          title?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "tests_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_revisions: {
        Row: {
          id: string
          last_revised_at: string
          retention_score: number
          times_revised: number
          topic_id: string
          user_id: string
        }
        Insert: {
          id?: string
          last_revised_at?: string
          retention_score?: number
          times_revised?: number
          topic_id: string
          user_id: string
        }
        Update: {
          id?: string
          last_revised_at?: string
          retention_score?: number
          times_revised?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_revisions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "study_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          id: string
          name: string
          sort_order: number
          subject_id: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          subject_id: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exams: {
        Row: {
          added_at: string
          exam_date: string | null
          exam_name: string
          id: string
          target_date: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          exam_date?: string | null
          exam_name: string
          id?: string
          target_date?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          exam_date?: string | null
          exam_name?: string
          id?: string
          target_date?: string | null
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
      user_streaks: {
        Row: {
          current_streak: number
          last_active_date: string | null
          longest_streak: number
          merit_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          merit_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          merit_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_topic_mastery: {
        Row: {
          correct: number
          id: string
          last_seen_at: string
          topic_id: string
          total: number
          user_id: string
        }
        Insert: {
          correct?: number
          id?: string
          last_seen_at?: string
          topic_id: string
          total?: number
          user_id: string
        }
        Update: {
          correct?: number
          id?: string
          last_seen_at?: string
          topic_id?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_mastery_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          city: string | null
          current_streak: number | null
          first_name: string | null
          merit_points: number | null
          rank: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
