"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CharacterRow, Message, Player, Room } from "@/lib/useRoomState";
import { restartGame, sendChatMessage } from "@/lib/game";
import { CharacterThumb } from "./CharacterThumb";
import { MessageLog } from "./MessageLog";

const PODIUM_ORDER = [2, 1, 3] as const;
const PODIUM_HEIGHT: Record<number, string> = { 1: "h-56", 2: "h-40", 3: "h-32" };

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

  const ranked = useMemo(
    () =>
      [...players]
        .sort((a, b) => (solvesByPlayerId[b.id]?.size ?? 0) - (solvesByPlayerId[a.id]?.size ?? 0))
        .slice(0, 3),
    [players, solvesByPlayerId]
  );

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
      <div className="text-center">
        <h1 className="text-2xl font-black text-pink-dark">🏆 Podium</h1>
      </div>
      <div className="flex items-end justify-center gap-3">
        {PODIUM_ORDER.map((rank) => {
          const player = ranked[rank - 1];
          const solvedCharacters = player
            ? [...(solvesByPlayerId[player.id] ?? [])]
                .map((id) => charactersById[identitiesByPlayerId[id]])
                .filter(Boolean)
            : [];

          return (
            <div key={rank} className="flex w-28 flex-col items-center gap-2 sm:w-36">
              {solvedCharacters.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-1">
                  {solvedCharacters.map((c) => (
                    <div key={c.id} className="w-12 sm:w-14">
                      <CharacterThumb character={c} highlighted={rank === 1} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-12" />
              )}
              <div
                className={`flex w-full items-end justify-center rounded-2xl border-[3px] border-pink bg-pink-tint pb-3 shadow-[0_4px_0_var(--pink)] ${PODIUM_HEIGHT[rank]}`}
              >
                <span className="text-4xl font-black text-pink-dark/60">{rank}</span>
              </div>
            </div>
          );
        })}
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

      <div>
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
