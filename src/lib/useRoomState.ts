"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { Tables } from "./supabase/database.types";

export type Room = Tables<"rooms">;
export type Player = Tables<"players">;
export type CharacterRow = Tables<"characters">;
export type Message = Tables<"messages">;

export type RoomState = {
  loading: boolean;
  error: string | null;
  room: Room | null;
  players: Player[];
  characters: CharacterRow[];
  messages: Message[];
  // Only ever contains rows visible under RLS: my own identity, plus everyone
  // once the game has finished (the reveal screen).
  identitiesByPlayerId: Record<string, string>;
  // Same visibility rule: playerId -> set of opponent ids they've correctly
  // unmasked. Only ever contains my own row pre-finish, everyone once finished.
  solvesByPlayerId: Record<string, Set<string>>;
  // One independent elimination board per opponent: aboutPlayerId -> marked character ids.
  myMarksByAboutPlayerId: Record<string, Set<string>>;
};

const initialState: RoomState = {
  loading: true,
  error: null,
  room: null,
  players: [],
  characters: [],
  messages: [],
  identitiesByPlayerId: {},
  solvesByPlayerId: {},
  myMarksByAboutPlayerId: {},
};

export function useRoomState(roomId: string | null, myPlayerId: string | null) {
  const [supabase] = useState(() => createClient());
  const [state, setState] = useState<RoomState>(initialState);

  const refetch = useCallback(async () => {
    if (!roomId) return;
    const [roomRes, playersRes, charactersRes, messagesRes, identitiesRes, solvesRes] =
      await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).maybeSingle(),
        supabase.from("players").select("*").eq("room_id", roomId).order("joined_at"),
        supabase.from("characters").select("*").eq("room_id", roomId).order("sort_order"),
        supabase.from("messages").select("*").eq("room_id", roomId).order("created_at"),
        // RLS only ever returns: my own identity, plus everyone once finished.
        supabase
          .from("player_identities")
          .select("player_id, character_id, players!inner(room_id)")
          .eq("players.room_id", roomId),
        // player_solves has two FKs to players (player_id and solved_player_id),
        // so the embed must name which relationship to join through.
        supabase
          .from("player_solves")
          .select("player_id, solved_player_id, players!player_solves_player_id_fkey!inner(room_id)")
          .eq("players.room_id", roomId),
      ]);

    const identitiesByPlayerId: Record<string, string> = {};
    for (const row of identitiesRes.data ?? []) {
      identitiesByPlayerId[row.player_id] = row.character_id;
    }

    const solvesByPlayerId: Record<string, Set<string>> = {};
    for (const row of solvesRes.data ?? []) {
      (solvesByPlayerId[row.player_id] ??= new Set()).add(row.solved_player_id);
    }

    const myMarksByAboutPlayerId: Record<string, Set<string>> = {};
    if (myPlayerId) {
      const marksRes = await supabase
        .from("board_marks")
        .select("character_id, about_player_id")
        .eq("player_id", myPlayerId);
      for (const row of marksRes.data ?? []) {
        (myMarksByAboutPlayerId[row.about_player_id] ??= new Set()).add(row.character_id);
      }
    }

    setState({
      loading: false,
      error: roomRes.error ? roomRes.error.message : null,
      room: roomRes.data ?? null,
      players: playersRes.data ?? [],
      characters: charactersRes.data ?? [],
      messages: messagesRes.data ?? [],
      identitiesByPlayerId,
      solvesByPlayerId,
      myMarksByAboutPlayerId,
    });
  }, [roomId, myPlayerId, supabase]);

  useEffect(() => {
    if (!roomId) return;

    // Initial sync with the external system (Supabase); further updates come
    // from the realtime subscription callbacks below, not from here directly.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        refetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
        refetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "characters", filter: `room_id=eq.${roomId}` },
        refetch
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        refetch
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refetch, supabase]);

  return { ...state, supabase, refetch };
}
