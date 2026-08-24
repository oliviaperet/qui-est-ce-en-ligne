"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthUserId } from "@/lib/session";
import { useRoomState } from "@/lib/useRoomState";
import { joinRoom } from "@/lib/game";
import { createClient } from "@/lib/supabase/client";
import { clearRoomIdentity, loadRoomIdentity, saveRoomIdentity } from "@/lib/roomStorage";
import { JoinForm } from "@/components/room/JoinForm";
import { Lobby } from "@/components/room/Lobby";
import { GameActive } from "@/components/room/GameActive";
import { GameFinished } from "@/components/room/GameFinished";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toString().toUpperCase();
  const userId = useAuthUserId();

  const [identity, setIdentity] = useState<{ roomId: string; playerId: string } | null | undefined>(
    undefined
  );

  useEffect(() => {
    // localStorage is only readable post-mount (SSR has no window); deferring
    // this read to an effect avoids a server/client hydration mismatch.
    if (!code) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdentity(loadRoomIdentity(code) ?? null);
  }, [code]);

  const {
    loading,
    error,
    room,
    players,
    characters,
    messages,
    identitiesByPlayerId,
    targetsByPlayerId,
    myMarkedCharacterIds,
    supabase,
  } = useRoomState(identity?.roomId ?? null, identity?.playerId ?? null);

  useEffect(() => {
    // Reacting to a fetch failure from useRoomState (an external system), not
    // deriving state from props/state available during render.
    if (!identity || loading) return;
    if (error || !room) {
      clearRoomIdentity(code);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdentity(null);
    }
  }, [identity, loading, error, room, code]);

  async function handleJoin(name: string) {
    const client = createClient();
    const result = await joinRoom(client, code, name);
    saveRoomIdentity(code, { roomId: result.room_id, playerId: result.player_id });
    setIdentity({ roomId: result.room_id, playerId: result.player_id });
  }

  if (!userId || identity === undefined || !code) {
    return <CenteredMessage text="Chargement…" />;
  }

  if (!identity) {
    return <JoinForm code={code} onJoin={handleJoin} />;
  }

  if (loading) {
    return <CenteredMessage text="Chargement de la partie…" />;
  }

  if (error || !room) {
    return <CenteredMessage text="Chargement…" />;
  }

  const myPlayer = players.find((p) => p.id === identity.playerId);
  if (!myPlayer) {
    return <CenteredMessage text="Connexion au salon…" />;
  }

  if (room.status === "lobby") {
    return (
      <Lobby supabase={supabase} room={room} players={players} characters={characters} myPlayer={myPlayer} />
    );
  }

  if (room.status === "active") {
    return (
      <GameActive
        supabase={supabase}
        room={room}
        players={players}
        characters={characters}
        messages={messages}
        myPlayer={myPlayer}
        identitiesByPlayerId={identitiesByPlayerId}
        targetsByPlayerId={targetsByPlayerId}
        myMarkedCharacterIds={myMarkedCharacterIds}
      />
    );
  }

  return (
    <GameFinished
      supabase={supabase}
      room={room}
      players={players}
      characters={characters}
      messages={messages}
      myPlayer={myPlayer}
      identitiesByPlayerId={identitiesByPlayerId}
      targetsByPlayerId={targetsByPlayerId}
    />
  );
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <p className="font-bold text-blue-dark/60">{text}</p>
    </main>
  );
}
