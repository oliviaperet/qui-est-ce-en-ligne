"use client";

import type { CharacterRow, Player } from "@/lib/useRoomState";

export function PlayerList({
  players,
  myPlayerId,
  currentTurnPlayerId,
  identitiesByPlayerId,
  charactersById,
  winnerPlayerIds,
  showTurn = false,
}: {
  players: Player[];
  myPlayerId: string;
  currentTurnPlayerId?: string | null;
  identitiesByPlayerId: Record<string, string>;
  charactersById: Record<string, CharacterRow>;
  winnerPlayerIds?: string[] | null;
  showTurn?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => {
        const isMe = player.id === myPlayerId;
        const isTurn = showTurn && player.id === currentTurnPlayerId;
        const isWinner = winnerPlayerIds?.includes(player.id) ?? false;
        const revealedCharacterId = identitiesByPlayerId[player.id];
        const revealedCharacter = revealedCharacterId
          ? charactersById[revealedCharacterId]
          : undefined;

        return (
          <li
            key={player.id}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-medium ${
              isTurn
                ? "border-pink bg-pink-tint"
                : isWinner
                  ? "border-amber-400 bg-amber-50"
                  : "border-blue-tint bg-white"
            }`}
          >
            {revealedCharacter && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={revealedCharacter.image_path}
                alt={revealedCharacter.name}
                className="h-7 w-7 rounded-full border-2 border-blue object-cover"
              />
            )}
            <span>
              {isWinner ? "🏆 " : ""}
              {player.name}
              {isMe ? " (toi)" : ""}
            </span>
            {player.is_host && (
              <span className="rounded-full bg-blue-tint px-2 py-0.5 text-[10px] font-black text-blue-dark">
                hôte
              </span>
            )}
            {isTurn && (
              <span className="ml-auto rounded-full bg-pink px-2 py-0.5 text-[10px] font-black text-white">
                tour
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
