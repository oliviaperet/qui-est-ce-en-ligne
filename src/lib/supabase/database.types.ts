export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      board_marks: {
        Row: {
          about_player_id: string
          character_id: string
          marked: boolean
          player_id: string
        }
        Insert: {
          about_player_id: string
          character_id: string
          marked?: boolean
          player_id: string
        }
        Update: {
          about_player_id?: string
          character_id?: string
          marked?: boolean
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_marks_about_player_id_fkey"
            columns: ["about_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_marks_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_marks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          id: string
          image_path: string
          name: string
          room_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          image_path: string
          name?: string
          room_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          image_path?: string
          name?: string
          room_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: number
          meta: Json
          room_id: string
          sender_player_id: string | null
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: never
          meta?: Json
          room_id: string
          sender_player_id?: string | null
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          meta?: Json
          room_id?: string
          sender_player_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_player_id_fkey"
            columns: ["sender_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_identities: {
        Row: {
          character_id: string
          player_id: string
        }
        Insert: {
          character_id: string
          player_id: string
        }
        Update: {
          character_id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_identities_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_identities_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_solves: {
        Row: {
          player_id: string
          solved_at: string
          solved_player_id: string
        }
        Insert: {
          player_id: string
          solved_at?: string
          solved_player_id: string
        }
        Update: {
          player_id?: string
          solved_at?: string
          solved_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_solves_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_solves_solved_player_id_fkey"
            columns: ["solved_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          auth_user_id: string
          id: string
          is_host: boolean
          joined_at: string
          name: string
          room_id: string
        }
        Insert: {
          auth_user_id: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name: string
          room_id: string
        }
        Update: {
          auth_user_id?: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          current_question_message_id: number | null
          current_turn_index: number
          final_round_queue: string[] | null
          final_round_winners: string[] | null
          id: string
          status: string
          turn_order: string[] | null
          turn_phase: string | null
          winner_player_ids: string[] | null
        }
        Insert: {
          code: string
          created_at?: string
          current_question_message_id?: number | null
          current_turn_index?: number
          final_round_queue?: string[] | null
          final_round_winners?: string[] | null
          id?: string
          status?: string
          turn_order?: string[] | null
          turn_phase?: string | null
          winner_player_ids?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string
          current_question_message_id?: number | null
          current_turn_index?: number
          final_round_queue?: string[] | null
          final_round_winners?: string[] | null
          id?: string
          status?: string
          turn_order?: string[] | null
          turn_phase?: string | null
          winner_player_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_current_question_message_id_fkey"
            columns: ["current_question_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ask_question: {
        Args: { p_content: string; p_room_id: string }
        Returns: undefined
      }
      create_room: {
        Args: { p_host_name: string }
        Returns: {
          player_id: string
          room_code: string
          room_id: string
        }[]
      }
      end_turn: { Args: { p_room_id: string }; Returns: undefined }
      generate_room_code: { Args: never; Returns: string }
      is_room_member: { Args: { target_room_id: string }; Returns: boolean }
      join_room: {
        Args: { p_code: string; p_name: string }
        Returns: {
          player_id: string
          room_id: string
        }[]
      }
      restart_game: { Args: { p_room_id: string }; Returns: undefined }
      start_game: { Args: { p_room_id: string }; Returns: undefined }
      submit_answer: {
        Args: { p_answer: boolean; p_room_id: string }
        Returns: undefined
      }
      submit_guess: {
        Args: {
          p_character_id: string
          p_room_id: string
          p_target_player_id: string
        }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
