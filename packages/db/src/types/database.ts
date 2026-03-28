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
      ai_user_profile: {
        Row: {
          active_vocab: Json | null
          created_at: string | null
          grammar_weak_points: string[] | null
          hsk_estimate: string | null
          last_computed_at: string | null
          phoneme_errors: Json | null
          updated_at: string | null
          user_id: string
          weak_vocab_tags: string[] | null
        }
        Insert: {
          active_vocab?: Json | null
          created_at?: string | null
          grammar_weak_points?: string[] | null
          hsk_estimate?: string | null
          last_computed_at?: string | null
          phoneme_errors?: Json | null
          updated_at?: string | null
          user_id: string
          weak_vocab_tags?: string[] | null
        }
        Update: {
          active_vocab?: Json | null
          created_at?: string | null
          grammar_weak_points?: string[] | null
          hsk_estimate?: string | null
          last_computed_at?: string | null
          phoneme_errors?: Json | null
          updated_at?: string | null
          user_id?: string
          weak_vocab_tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: 'ai_user_profile_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
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
      essay_submissions: {
        Row: {
          ai_feedback: Json | null
          cefr_score: string | null
          created_at: string | null
          id: string
          prompt_text: string | null
          tokens_used: number | null
          user_essay: string
          user_id: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          cefr_score?: string | null
          created_at?: string | null
          id?: string
          prompt_text?: string | null
          tokens_used?: number | null
          user_essay: string
          user_id?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          cefr_score?: string | null
          created_at?: string | null
          id?: string
          prompt_text?: string | null
          tokens_used?: number | null
          user_essay?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'essay_submissions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      global_cards: {
        Row: {
          audio_url: string | null
          components: string[] | null
          content: Json
          created_at: string | null
          definition_en: string | null
          definition_th: string
          examples: Json | null
          hsk_level: string | null
          id: string
          pinyin: string | null
          pinyin_numbered: string | null
          search_count: number | null
          stroke_count: number | null
          tones: number[] | null
          updated_at: string | null
          usage_count: number | null
          word: string
        }
        Insert: {
          audio_url?: string | null
          components?: string[] | null
          content: Json
          created_at?: string | null
          definition_en?: string | null
          definition_th: string
          examples?: Json | null
          hsk_level?: string | null
          id?: string
          pinyin?: string | null
          pinyin_numbered?: string | null
          search_count?: number | null
          stroke_count?: number | null
          tones?: number[] | null
          updated_at?: string | null
          usage_count?: number | null
          word: string
        }
        Update: {
          audio_url?: string | null
          components?: string[] | null
          content?: Json
          created_at?: string | null
          definition_en?: string | null
          definition_th?: string
          examples?: Json | null
          hsk_level?: string | null
          id?: string
          pinyin?: string | null
          pinyin_numbered?: string | null
          search_count?: number | null
          stroke_count?: number | null
          tones?: number[] | null
          updated_at?: string | null
          usage_count?: number | null
          word?: string
        }
        Relationships: []
      }
      hsk_reviews: {
        Row: {
          assessed_at: string | null
          created_at: string
          difficulty: number
          hsk_level: number
          id: string
          next_review_at: string
          review_count: number
          stability: number
          state: string
          user_id: string
          word_simplified: string
        }
        Insert: {
          assessed_at?: string | null
          created_at?: string
          difficulty?: number
          hsk_level: number
          id?: string
          next_review_at?: string
          review_count?: number
          stability?: number
          state?: string
          user_id: string
          word_simplified: string
        }
        Update: {
          assessed_at?: string | null
          created_at?: string
          difficulty?: number
          hsk_level?: number
          id?: string
          next_review_at?: string
          review_count?: number
          stability?: number
          state?: string
          user_id?: string
          word_simplified?: string
        }
        Relationships: [
          {
            foreignKeyName: 'hsk_reviews_user_id_fkey'
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
          hsk_self_assessed: string | null
          id: string
          is_banned: boolean | null
          learning_goal: string | null
          onboarding_completed: boolean | null
          role: string | null
          subscription: string | null
          subscription_expires_at: string | null
          trust_score: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string | null
          daily_goal_minutes?: number | null
          display_name?: string | null
          email?: string | null
          hsk_self_assessed?: string | null
          id: string
          is_banned?: boolean | null
          learning_goal?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          subscription?: string | null
          subscription_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          created_at?: string | null
          daily_goal_minutes?: number | null
          display_name?: string | null
          email?: string | null
          hsk_self_assessed?: string | null
          id?: string
          is_banned?: boolean | null
          learning_goal?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          subscription?: string | null
          subscription_expires_at?: string | null
          trust_score?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      review_logs: {
        Row: {
          card_id: string
          difficulty: number | null
          due: string
          elapsed_days: number | null
          id: string
          last_elapsed_days: number | null
          rating: string
          review_duration_ms: number | null
          reviewed_at: string | null
          scheduled_days: number | null
          stability: number | null
          state: string
          user_id: string
        }
        Insert: {
          card_id: string
          difficulty?: number | null
          due: string
          elapsed_days?: number | null
          id?: string
          last_elapsed_days?: number | null
          rating: string
          review_duration_ms?: number | null
          reviewed_at?: string | null
          scheduled_days?: number | null
          stability?: number | null
          state: string
          user_id: string
        }
        Update: {
          card_id?: string
          difficulty?: number | null
          due?: string
          elapsed_days?: number | null
          id?: string
          last_elapsed_days?: number | null
          rating?: string
          review_duration_ms?: number | null
          reviewed_at?: string | null
          scheduled_days?: number | null
          stability?: number | null
          state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'review_logs_global_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'global_cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
      user_category_progress: {
        Row: {
          category_id: string
          completed_at: string | null
          is_completed: boolean | null
          last_studied_at: string | null
          learned_words: number | null
          mastered_words: number | null
          progress_percentage: number | null
          total_words: number | null
          user_id: string
        }
        Insert: {
          category_id: string
          completed_at?: string | null
          is_completed?: boolean | null
          last_studied_at?: string | null
          learned_words?: number | null
          mastered_words?: number | null
          progress_percentage?: number | null
          total_words?: number | null
          user_id: string
        }
        Update: {
          category_id?: string
          completed_at?: string | null
          is_completed?: boolean | null
          last_studied_at?: string | null
          learned_words?: number | null
          mastered_words?: number | null
          progress_percentage?: number | null
          total_words?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_category_progress_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'vocabulary_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_category_progress_user_id_fkey'
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
          card_type: string | null
          correct_count: number | null
          created_at: string | null
          difficulty_rating: number | null
          ease_factor: number | null
          fsrs_data: Json | null
          fsrs_state: string | null
          id: string
          interval_days: number | null
          is_mastered: boolean | null
          last_elapsed_days: number | null
          last_reviewed_at: string | null
          next_review_at: string | null
          repetitions: number | null
          scheduled_days: number | null
          stability: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_id?: string | null
          card_type?: string | null
          correct_count?: number | null
          created_at?: string | null
          difficulty_rating?: number | null
          ease_factor?: number | null
          fsrs_data?: Json | null
          fsrs_state?: string | null
          id?: string
          interval_days?: number | null
          is_mastered?: boolean | null
          last_elapsed_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          scheduled_days?: number | null
          stability?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_id?: string | null
          card_type?: string | null
          correct_count?: number | null
          created_at?: string | null
          difficulty_rating?: number | null
          ease_factor?: number | null
          fsrs_data?: Json | null
          fsrs_state?: string | null
          id?: string
          interval_days?: number | null
          is_mastered?: boolean | null
          last_elapsed_days?: number | null
          last_reviewed_at?: string | null
          next_review_at?: string | null
          repetitions?: number | null
          scheduled_days?: number | null
          stability?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_progress_card_id_global_cards_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'global_cards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_progress_global_card_id_fkey'
            columns: ['card_id']
            isOneToOne: false
            referencedRelation: 'global_cards'
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
      vocabulary_categories: {
        Row: {
          category_type: string
          color: string | null
          created_at: string | null
          description_en: string | null
          description_th: string | null
          difficulty: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_official: boolean | null
          level: number
          name_en: string
          name_th: string
          name_zh: string | null
          parent_id: string | null
          priority: number | null
          slug: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          category_type: string
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_th?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_official?: boolean | null
          level: number
          name_en: string
          name_th: string
          name_zh?: string | null
          parent_id?: string | null
          priority?: number | null
          slug: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          category_type?: string
          color?: string | null
          created_at?: string | null
          description_en?: string | null
          description_th?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_official?: boolean | null
          level?: number
          name_en?: string
          name_th?: string
          name_zh?: string | null
          parent_id?: string | null
          priority?: number | null
          slug?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'vocabulary_categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'vocabulary_categories'
            referencedColumns: ['id']
          },
        ]
      }
      word_category_mapping: {
        Row: {
          added_at: string | null
          category_id: string
          is_primary: boolean | null
          word_id: string
        }
        Insert: {
          added_at?: string | null
          category_id: string
          is_primary?: boolean | null
          word_id: string
        }
        Update: {
          added_at?: string | null
          category_id?: string
          is_primary?: boolean | null
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'word_category_mapping_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'vocabulary_categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'word_category_mapping_word_id_fkey'
            columns: ['word_id']
            isOneToOne: false
            referencedRelation: 'global_cards'
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
