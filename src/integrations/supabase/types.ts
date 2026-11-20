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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      author_profiles: {
        Row: {
          biography: string | null
          country: string | null
          created_at: string
          display_name: string
          id: string
          newsletter_link: string | null
          social_links: string | null
          spotlight_qualified_at: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          biography?: string | null
          country?: string | null
          created_at?: string
          display_name: string
          id?: string
          newsletter_link?: string | null
          social_links?: string | null
          spotlight_qualified_at?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          biography?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          id?: string
          newsletter_link?: string | null
          social_links?: string | null
          spotlight_qualified_at?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      awards: {
        Row: {
          category: string | null
          created_at: string
          id: string
          note: string | null
          recipient: string
          title: string
          year: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          note?: string | null
          recipient: string
          title: string
          year?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          note?: string | null
          recipient?: string
          title?: string
          year?: number
        }
        Relationships: []
      }
      book_comments: {
        Row: {
          author_name: string
          body: string
          book_id: string
          chapter: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          book_id: string
          chapter: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          author_name?: string
          body?: string
          book_id?: string
          chapter?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_comments_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_review_helpful: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "book_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      book_review_reports: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          reason: string
          review_id: string
          reviewed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          reason: string
          review_id: string
          reviewed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          reason?: string
          review_id?: string
          reviewed_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "book_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      book_reviews: {
        Row: {
          body: string
          book_id: string
          created_at: string
          id: string
          rating: number
          reviewer_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          book_id: string
          created_at?: string
          id?: string
          rating: number
          reviewer_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          book_id?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_submissions: {
        Row: {
          admin_note: string | null
          author_bio: string | null
          author_country: string | null
          author_name: string
          author_website: string | null
          buy_link: string | null
          content_warnings: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          language: string | null
          newsletter_link: string | null
          other_purchase_links: string | null
          programs: string[]
          publication_date: string | null
          series_info: string | null
          social_links: string | null
          status: string
          synopsis: string | null
          title: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          author_bio?: string | null
          author_country?: string | null
          author_name: string
          author_website?: string | null
          buy_link?: string | null
          content_warnings?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          newsletter_link?: string | null
          other_purchase_links?: string | null
          programs?: string[]
          publication_date?: string | null
          series_info?: string | null
          social_links?: string | null
          status?: string
          synopsis?: string | null
          title: string
          user_id?: string
        }
        Update: {
          admin_note?: string | null
          author_bio?: string | null
          author_country?: string | null
          author_name?: string
          author_website?: string | null
          buy_link?: string | null
          content_warnings?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          newsletter_link?: string | null
          other_purchase_links?: string | null
          programs?: string[]
          publication_date?: string | null
          series_info?: string | null
          social_links?: string | null
          status?: string
          synopsis?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author_name: string
          author_user_id: string | null
          buy_link: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          excerpt: string | null
          featured: boolean
          genre: string | null
          id: string
          other_purchase_links: string | null
          program: string | null
          publisher: string | null
          synopsis: string | null
          title: string
          total_chapters: number
        }
        Insert: {
          author_name: string
          author_user_id?: string | null
          buy_link?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          featured?: boolean
          genre?: string | null
          id?: string
          other_purchase_links?: string | null
          program?: string | null
          publisher?: string | null
          synopsis?: string | null
          title: string
          total_chapters?: number
        }
        Update: {
          author_name?: string
          author_user_id?: string | null
          buy_link?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          excerpt?: string | null
          featured?: boolean
          genre?: string | null
          id?: string
          other_purchase_links?: string | null
          program?: string | null
          publisher?: string | null
          synopsis?: string | null
          title?: string
          total_chapters?: number
        }
        Relationships: []
      }
      challenge_enrollments: {
        Row: {
          goal: number
          joined_at: string
          user_id: string
        }
        Insert: {
          goal?: number
          joined_at?: string
          user_id: string
        }
        Update: {
          goal?: number
          joined_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_application_events: {
        Row: {
          actor_user_id: string | null
          application_id: string
          created_at: string
          id: string
          new_status: string
          note: string | null
          previous_status: string | null
        }
        Insert: {
          actor_user_id?: string | null
          application_id: string
          created_at?: string
          id?: string
          new_status: string
          note?: string | null
          previous_status?: string | null
        }
        Update: {
          actor_user_id?: string | null
          application_id?: string
          created_at?: string
          id?: string
          new_status?: string
          note?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "community_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      community_applications: {
        Row: {
          admin_note: string | null
          application_type: string
          city: string | null
          country: string | null
          created_at: string
          email: string
          existing_member_id: string | null
          favorite_authors: string | null
          favorite_genres: string[]
          full_name: string
          id: string
          member_id: string | null
          message: string | null
          payer_name: string | null
          payment_date: string | null
          payment_method: string | null
          payment_proof_path: string | null
          preferred_username: string | null
          reading_interests: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_reference: string | null
          user_id: string
          why_join: string | null
        }
        Insert: {
          admin_note?: string | null
          application_type?: string
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          existing_member_id?: string | null
          favorite_authors?: string | null
          favorite_genres?: string[]
          full_name: string
          id?: string
          member_id?: string | null
          message?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_path?: string | null
          preferred_username?: string | null
          reading_interests?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_reference?: string | null
          user_id?: string
          why_join?: string | null
        }
        Update: {
          admin_note?: string | null
          application_type?: string
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          existing_member_id?: string | null
          favorite_authors?: string | null
          favorite_genres?: string[]
          full_name?: string
          id?: string
          member_id?: string | null
          message?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_proof_path?: string | null
          preferred_username?: string | null
          reading_interests?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_reference?: string | null
          user_id?: string
          why_join?: string | null
        }
        Relationships: []
      }
      community_buddy_requests: {
        Row: {
          availability: string
          book_title: string
          created_at: string
          id: string
          pace: string
          user_id: string
        }
        Insert: {
          availability: string
          book_title: string
          created_at?: string
          id?: string
          pace: string
          user_id: string
        }
        Update: {
          availability?: string
          book_title?: string
          created_at?: string
          id?: string
          pace?: string
          user_id?: string
        }
        Relationships: []
      }
      community_discussions: {
        Row: {
          author_name: string
          body: string
          category: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          author_name: string
          body: string
          category: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          author_name?: string
          body?: string
          category?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          joined_at: string
          member_id: string | null
          user_id: string
        }
        Insert: {
          joined_at?: string
          member_id?: string | null
          user_id: string
        }
        Update: {
          joined_at?: string
          member_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_poll_votes: {
        Row: {
          choice: string
          created_at: string
          id: string
          poll_key: string
          user_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          id?: string
          poll_key: string
          user_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          id?: string
          poll_key?: string
          user_id?: string
        }
        Relationships: []
      }
      competition_book_votes: {
        Row: {
          book_id: string
          campaign_key: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          campaign_key?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          campaign_key?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_book_votes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          program: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          program: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          program?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_author: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_author?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_author?: boolean
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          chapter: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          book_id?: string
          chapter?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      shelf: {
        Row: {
          book_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          book_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelf_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      spikes: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          published: boolean
          title: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          title: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      book_engagement_stats: {
        Args: never
        Returns: {
          average_rating: number
          book_id: string
          challenge_comments: number
          challenge_completions: number
          challenge_unique_readers: number
          comments: number
          engagement_score: number
          finished: number
          rating_count: number
          readers: number
          review_count: number
          votes: number
        }[]
      }
      book_review_helpful_counts: {
        Args: never
        Returns: {
          helpful_count: number
          review_id: string
        }[]
      }
      book_stats: {
        Args: never
        Returns: {
          book_id: string
          comments: number
          finished: number
          readers: number
          week_activity: number
        }[]
      }
      community_book_vote_counts: {
        Args: { _campaign_key?: string }
        Returns: {
          book_id: string
          votes: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      member_count: { Args: never; Returns: number }
      review_community_application: {
        Args: {
          _admin_note?: string
          _application_id: string
          _approve: boolean
        }
        Returns: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
