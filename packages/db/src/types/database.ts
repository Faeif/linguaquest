export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cards: {
        Row: {
          audio_url_uk: string | null
          audio_url_us: string | null
          cefr_level: string | null
          collocations: string[] | null
          created_at: string | null
          deck_id: string | null
          etymology: string | null
          examples: Json | null
          id: string
          image_url: string | null
          ipa: string | null
          meaning_en: string | null
          meaning_th: string
          position: number | null
          register: string | null
          synonyms: string[] | null
          word: string
          word_family: string[] | null
        }
        Insert: {
          audio_url_uk?: string | null
          audio_url_us?: string | null
          cefr_level?: string | null
          collocations?: string[] | null
          created_at?: string | null
          deck_id?: string | null
          etymology?: string | null
          examples?: Json | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          meaning_en?: string | null
          meaning_th: string
          position?: number | null
          register?: string | null
          synonyms?: string[] | null
          word: string
          word_family?: string[] | null
        }
        Update: {
          audio_url_uk?: string | null
          audio_url_us?: string | null
          cefr_level?: string | null
          collocations?: string[] | null
          created_at?: string | null
          deck_id?: string | null
          etymology?: string | null
          examples?: Json | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          meaning_en?: string | null
          meaning_th?: string
          position?: number | null
          register?: string | null
          synonyms?: string[] | null
          word?: string
          word_family?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'cards_deck_id_fkey'
            columns: ['deck_id']
            isOneToOne: false
            referencedRelation: 'decks'
            referencedColumns: ['id']
          },
        ]
      }
      decks: {
        Row: {
          card_count: number | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_approved: boolean | null
          is_official: boolean | null
          is_premium: boolean | null
          is_public: boolean | null
          language_from: string | null
          language_to: string | null
          learner_count: number | null
          level: string | null
          license: string | null
          price_thb: number | null
          score: number | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_count?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          is_official?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          language_from?: string | null
          language_to?: string | null
          learner_count?: number | null
          level?: string | null
          license?: string | null
          price_thb?: number | null
          score?: number | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_count?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_approved?: boolean | null
          is_official?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          language_from?: string | null
          language_to?: string | null
          learner_count?: number | null
          level?: string | null
          license?: string | null
          price_thb?: number | null
          score?: number | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'decks_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          created_at: string | null
          daily_goal_minutes: number | null
          display_name: string | null
          email: string | null
          goal: string | null
          id: string
          is_banned: boolean | null
          level: string | null
          onboarding_completed: boolean | null
          role: string | null
          subscription: string | null
          subscription_expires_at: string | null
          trust_score: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string | null
          daily_goal_minutes?: number | null
          display_name?: string | null
          email?: string | null
          goal?: string | null
          id: string
          is_banned?: boolean | null
          level?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          subscription?: string | null
          subscription_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string | null
          daily_goal_minutes?: number | null
          display_name?: string | null
          email?: string | null
          goal?: string | null
          id?: string
          is_banned?: boolean | null
          level?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          subscription?: string | null
          subscription_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          cards_correct: number | null
          cards_studied: number | null
          completed_at: string | null
          deck_id: string | null
          duration_seconds: number | null
          id: string
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          cards_correct?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          deck_id?: string | null
          duration_seconds?: number | null
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          cards_correct?: number | null
          cards_studied?: number | null
          completed_at?: string | null
          deck_id?: string | null
          duration_seconds?: number | null
          id?: string
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'study_sessions_deck_id_fkey'
            columns: ['deck_id']
            isOneToOne: false
            referencedRelation: 'decks'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'study_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_progress: {
        Row: {
          card_id: string | null
          correct_count: number | null
          created_at: string | null
          ease_factor: number | null
          id: string
          interval_days: number | null
          is_mastered: boolean | null
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          correct_count?: number | null
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          is_mastered?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          correct_count?: number | null
          created_at?: string | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          is_mastered?: boolean | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_progress_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_progress_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_stats: {
        Row: {
          current_streak: number | null
          last_study_date: string | null
          level: number | null
          listening_band_estimate: number | null
          longest_streak: number | null
          monthly_xp: number | null
          reading_band_estimate: number | null
          speaking_band_estimate: number | null
          streak_freeze_count: number | null
          total_cards_mastered: number | null
          total_cards_studied: number | null
          total_study_minutes: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          weekly_xp: number | null
          writing_band_estimate: number | null
        }
        Insert: {
          current_streak?: number | null
          last_study_date?: string | null
          level?: number | null
          listening_band_estimate?: number | null
          longest_streak?: number | null
          monthly_xp?: number | null
          reading_band_estimate?: number | null
          speaking_band_estimate?: number | null
          streak_freeze_count?: number | null
          total_cards_mastered?: number | null
          total_cards_studied?: number | null
          total_study_minutes?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          weekly_xp?: number | null
          writing_band_estimate?: number | null
        }
        Update: {
          current_streak?: number | null
          last_study_date?: string | null
          level?: number | null
          listening_band_estimate?: number | null
          longest_streak?: number | null
          monthly_xp?: number | null
          reading_band_estimate?: number | null
          speaking_band_estimate?: number | null
          streak_freeze_count?: number | null
          total_cards_mastered?: number | null
          total_cards_studied?: number | null
          total_study_minutes?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_xp?: number | null
          writing_band_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_stats_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
