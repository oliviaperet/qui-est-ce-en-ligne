import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/database.types";

type DB = SupabaseClient<Database>;

export async function createRoom(supabase: DB, hostName: string) {
  const { data, error } = await supabase.rpc("create_room", { p_host_name: hostName });
  if (error) throw error;
  return data[0];
}

export async function joinRoom(supabase: DB, code: string, name: string) {
  const { data, error } = await supabase.rpc("join_room", { p_code: code, p_name: name });
  if (error) throw error;
  return data[0];
}

export async function startGame(supabase: DB, roomId: string) {
  const { error } = await supabase.rpc("start_game", { p_room_id: roomId });
  if (error) throw error;
}

export async function askQuestion(supabase: DB, roomId: string, content: string) {
  const { error } = await supabase.rpc("ask_question", { p_room_id: roomId, p_content: content });
  if (error) throw error;
}

export async function submitAnswer(supabase: DB, roomId: string, answer: boolean) {
  const { error } = await supabase.rpc("submit_answer", { p_room_id: roomId, p_answer: answer });
  if (error) throw error;
}

export async function submitGuess(supabase: DB, roomId: string, characterId: string) {
  const { data, error } = await supabase.rpc("submit_guess", {
    p_room_id: roomId,
    p_character_id: characterId,
  });
  if (error) throw error;
  return data;
}

export async function endTurn(supabase: DB, roomId: string) {
  const { error } = await supabase.rpc("end_turn", { p_room_id: roomId });
  if (error) throw error;
}

export async function restartGame(supabase: DB, roomId: string) {
  const { error } = await supabase.rpc("restart_game", { p_room_id: roomId });
  if (error) throw error;
}

export async function sendChatMessage(
  supabase: DB,
  roomId: string,
  senderPlayerId: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    room_id: roomId,
    sender_player_id: senderPlayerId,
    type: "chat",
    content,
  });
  if (error) throw error;
}

export async function toggleBoardMark(
  supabase: DB,
  playerId: string,
  characterId: string,
  marked: boolean
) {
  if (marked) {
    const { error } = await supabase
      .from("board_marks")
      .upsert({ player_id: playerId, character_id: characterId, marked: true });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("board_marks")
      .delete()
      .eq("player_id", playerId)
      .eq("character_id", characterId);
    if (error) throw error;
  }
}

// image_path stores the full public URL (the bucket is public), not a bare storage path.
export async function addCharacter(
  supabase: DB,
  roomId: string,
  name: string,
  imagePath: string,
  sortOrder: number
) {
  const { data, error } = await supabase
    .from("characters")
    .insert({ room_id: roomId, name, image_path: imagePath, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCharacter(supabase: DB, characterId: string) {
  const { error } = await supabase.from("characters").delete().eq("id", characterId);
  if (error) throw error;
}

export async function uploadCharacterPhoto(supabase: DB, roomId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${roomId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("character-photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("character-photos").getPublicUrl(path);
  return data.publicUrl;
}
