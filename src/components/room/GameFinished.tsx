"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CharacterRow, Message, Player, Room } from "@/lib/useRoomState";
import { restartGame, sendChatMessage } from "@/lib/game";
import { MessageLog } from "./MessageLog";

export function GameFinished({
  supabase,
  room,
  players,
  characters,
  messages,
  myPlayer,
  identitiesByPlayerId,
  solvesByPlayerId,
}: {
  supabase: SupabaseClient<Database>;
  room: Room;
  players: Player[];
  characters: CharacterRow[];
  messages: Message[];
  myPlayer: Player;
  identitiesByPlayerId: Record<string, string>;
  solvesByPlayerId: Record<string, Set<string>>;
}) {
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );
  const charactersById = useMemo(
    () => Object.fromEntries(characters.map((c) => [c.id, c])),
    [characters]
  );

  const winnerIds = room.winner_player_ids ?? [];
  const winners = winnerIds.map((id) => playersById[id]).filter(Boolean);

  async function handleRestart() {
    setRestarting(true);
    setError(null);
    try {
      await restartGame(supabase, room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de relancer la partie.");
      setRestarting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="game-card flex flex-col items-center gap-3 border-amber-400 bg-amber-50 p-6 text-center shadow-[0_4px_0_#d97706]">
        <div className="flex flex-wrap justify-center gap-3">
          {winners.map((w) => {
            const character = charactersById[identitiesByPlayerId[w.id]];
            return (
              <div key={w.id} className="flex flex-col items-center">
                {character && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={character.image_path}
                    alt={character.name}
                    className="h-16 w-16 rounded-full border-4 border-amber-400 object-cover"
                  />
                )}
                <p className="mt-1 text-sm font-black text-amber-800">{w.name}</p>
              </div>
            );
          })}
        </div>
        <h1 className="text-2xl font-black text-amber-800">
          🏆 {winners.map((w) => w.name).join(" et ") || "?"} remporte{winners.length > 1 ? "nt" : ""} la
          partie !
        </h1>
      </div>

      <section className="game-card border-blue p-4">
        <h2 className="mb-3 font-black text-blue-dark">Toutes les identités</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {players.map((p) => {
            const character = charactersById[identitiesByPlayerId[p.id]];
            const solved = [...(solvesByPlayerId[p.id] ?? [])]
              .map((id) => playersById[id]?.name)
              .filter(Boolean);
            const isWinner = winnerIds.includes(p.id);
            return (
              <li
                key={p.id}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${
                  isWinner ? "border-amber-400 bg-amber-50" : "border-blue-tint bg-white"
                }`}
              >
                {character && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={character.image_path}
                    alt={character.name}
                    className="h-8 w-8 rounded-full border-2 border-blue object-cover"
                  />
                )}
                <span>
                  <span className="font-bold">{p.name}</span> était{" "}
                  <span className="font-bold text-pink-dark">{character?.name ?? "?"}</span>
                  {solved.length > 0 && (
                    <>
                      {" "}
                      · a démasqué <span className="font-bold">{solved.join(", ")}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="h-64">
        <MessageLog
          messages={messages}
          playersById={playersById}
          onSendChat={(content) => sendChatMessage(supabase, room.id, myPlayer.id, content)}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        {myPlayer.is_host ? (
          <button
            type="button"
            onClick={handleRestart}
            disabled={restarting}
            className="rounded-full bg-pink px-6 py-3 font-black text-white shadow-[0_4px_0_var(--pink-dark)] disabled:opacity-40"
          >
            {restarting ? "Relance…" : "Rejouer avec les mêmes photos"}
          </button>
        ) : (
          <p className="text-sm font-bold text-blue-dark/60">
            En attente que l&apos;hôte relance une partie…
          </p>
        )}
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <Link href="/" className="text-sm font-bold text-blue-dark underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
