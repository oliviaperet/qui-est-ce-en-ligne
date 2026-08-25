"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CharacterRow, Message, Player, Room } from "@/lib/useRoomState";
import {
  askQuestion,
  endTurn,
  sendChatMessage,
  submitAnswer,
  submitGuess,
  toggleBoardMark,
} from "@/lib/game";
import { CharacterThumb } from "./CharacterThumb";
import { MessageLog } from "./MessageLog";

export function GameActive({
  supabase,
  room,
  players,
  characters,
  messages,
  myPlayer,
  identitiesByPlayerId,
  solvesByPlayerId,
  myMarksByAboutPlayerId,
  refetch,
}: {
  supabase: SupabaseClient<Database>;
  room: Room;
  players: Player[];
  characters: CharacterRow[];
  messages: Message[];
  myPlayer: Player;
  identitiesByPlayerId: Record<string, string>;
  solvesByPlayerId: Record<string, Set<string>>;
  myMarksByAboutPlayerId: Record<string, Set<string>>;
  refetch: () => void;
}) {
  const [questionDraft, setQuestionDraft] = useState("");
  const [guessMode, setGuessMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBoardPlayerId, setSelectedBoardPlayerId] = useState<string | null>(null);

  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );
  const otherPlayers = useMemo(
    () => players.filter((p) => p.id !== myPlayer.id),
    [players, myPlayer.id]
  );
  const mySolvedPlayerIds = solvesByPlayerId[myPlayer.id] ?? new Set<string>();

  const isFinalRound = room.turn_phase === "final_round";
  const currentTurnPlayerId = room.turn_order?.[room.current_turn_index] ?? null;
  const finalRoundActorId = room.final_round_queue?.[0] ?? null;
  const activeActorId = isFinalRound ? finalRoundActorId : currentTurnPlayerId;
  const isMyTurn = activeActorId === myPlayer.id;
  const myIdentityCharacterId = identitiesByPlayerId[myPlayer.id];
  const myIdentityCharacter = myIdentityCharacterId
    ? characters.find((c) => c.id === myIdentityCharacterId)
    : undefined;

  const boardPlayerId = selectedBoardPlayerId ?? otherPlayers[0]?.id ?? null;
  const boardPlayerName = boardPlayerId ? playersById[boardPlayerId]?.name : undefined;
  const boardMarkedCharacterIds = boardPlayerId
    ? myMarksByAboutPlayerId[boardPlayerId] ?? new Set<string>()
    : new Set<string>();

  const haveIAnswered = messages.some(
    (m) =>
      m.type === "answer" &&
      m.sender_player_id === myPlayer.id &&
      (m.meta as { question_message_id?: number } | null)?.question_message_id ===
        room.current_question_message_id
  );

  const currentQuestion = messages.find((m) => m.id === room.current_question_message_id);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGuess(characterId: string) {
    if (!boardPlayerId) return;
    await run(async () => {
      await submitGuess(supabase, room.id, boardPlayerId, characterId);
      setGuessMode(false);
    });
  }

  async function handleToggleMark(characterId: string) {
    if (!boardPlayerId) return;
    const marked = boardMarkedCharacterIds.has(characterId);
    await toggleBoardMark(supabase, myPlayer.id, boardPlayerId, characterId, !marked);
    refetch();
  }

  const actorName = activeActorId ? playersById[activeActorId]?.name : undefined;
  const isGuessingNow =
    (room.turn_phase === "choose" && isMyTurn && guessMode) || (isFinalRound && isMyTurn);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 lg:grid lg:grid-cols-[2.3fr_1fr]">
      {/* 1. Le grand plateau */}
      <section className="game-card order-2 flex flex-col border-blue p-4 lg:order-1">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-dark/50">
          {isGuessingNow
            ? `🎯 Clique sur le personnage que tu penses être ${boardPlayerName} :`
            : `Plateau pour démasquer ${boardPlayerName ?? "…"} — choisis un adversaire :`}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {otherPlayers.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedBoardPlayerId(p.id)}
              className={`rounded-full border-2 px-3 py-1 text-sm font-black transition ${
                boardPlayerId === p.id
                  ? "border-blue bg-blue text-white"
                  : "border-blue-tint bg-white text-blue-dark"
              } ${activeActorId === p.id ? "ring-2 ring-pink ring-offset-2" : ""}`}
            >
              {p.name}
              {mySolvedPlayerIds.has(p.id) ? " ✓" : ""}
            </button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {characters.map((c) =>
            isGuessingNow ? (
              <CharacterThumb
                key={c.id}
                character={c}
                highlighted={c.id === myIdentityCharacterId}
                onClick={() => handleGuess(c.id)}
              />
            ) : (
              <CharacterThumb
                key={c.id}
                character={c}
                crossedOut={boardMarkedCharacterIds.has(c.id)}
                highlighted={c.id === myIdentityCharacterId}
                onToggleEliminate={() => handleToggleMark(c.id)}
              />
            )
          )}
        </div>
      </section>

      <div className="order-1 flex flex-col gap-4 lg:order-2">
        {/* 2. Ton personnage */}
        <section className="game-card border-pink p-4">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-pink-dark/70">
            Ton personnage
          </p>
          {myIdentityCharacter && (
            <div className="mx-auto w-32 sm:w-40">
              <CharacterThumb character={myIdentityCharacter} highlighted badge="TOI" />
            </div>
          )}
          <p className="mt-2 text-center text-xs font-bold text-blue-dark/50">
            {mySolvedPlayerIds.size} / {otherPlayers.length} démasqués
          </p>
        </section>

        {/* 3. La question / la cible */}
        <section className="game-card border-blue p-4">
          <p className="mb-3 rounded-full bg-pink px-4 py-1.5 text-center text-sm font-black text-white">
            {isFinalRound && "⚡ Tour final — "}
            {isMyTurn ? "C'est ton tour !" : `Au tour de ${actorName ?? "…"}`}
          </p>

          {room.turn_phase === "choose" &&
            (isMyTurn ? (
              guessMode ? (
                <div className="flex flex-col gap-3">
                  <p className="text-center text-sm font-bold text-pink-dark">
                    Tu penses savoir qui est {boardPlayerName} ? Choisis son personnage sur le
                    plateau à gauche, ou :
                  </p>
                  <button
                    type="button"
                    onClick={() => setGuessMode(false)}
                    className="self-center text-sm font-bold text-blue-dark underline"
                  >
                    Annuler, poser une question à la place
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-center text-sm font-bold text-blue-dark">
                    Pose une question, ou tente ta chance !
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!questionDraft.trim()) return;
                      run(async () => {
                        await askQuestion(supabase, room.id, questionDraft.trim());
                        setQuestionDraft("");
                      });
                    }}
                    className="flex flex-col gap-2"
                  >
                    <input
                      value={questionDraft}
                      onChange={(e) => setQuestionDraft(e.target.value)}
                      placeholder="Pose ta question (réponse oui/non)…"
                      maxLength={200}
                      className="rounded-full border-2 border-blue-tint bg-white px-4 py-2 outline-none focus:border-blue"
                    />
                    <button
                      type="submit"
                      disabled={busy || !questionDraft.trim()}
                      className="rounded-full bg-blue px-4 py-2 font-black text-white shadow-[0_3px_0_var(--blue-dark)] disabled:opacity-40"
                    >
                      Demander
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => setGuessMode(true)}
                    disabled={!boardPlayerId}
                    className="self-center rounded-full bg-pink px-5 py-2 text-sm font-black text-white shadow-[0_3px_0_var(--pink-dark)] disabled:opacity-40"
                  >
                    🎯 Deviner qui est {boardPlayerName}
                  </button>
                </div>
              )
            ) : (
              <p className="text-center text-sm font-bold text-blue-dark/60">
                En attente du tour de {actorName}…
              </p>
            ))}

          {room.turn_phase === "answers" && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-center text-sm font-medium">
                <span className="font-black text-blue-dark">{actorName}</span> demande : «{" "}
                {currentQuestion?.content} »
              </p>
              {isMyTurn ? (
                <p className="text-sm font-bold text-blue-dark/60">
                  En attente des réponses des autres joueurs…
                </p>
              ) : haveIAnswered ? (
                <p className="text-sm font-bold text-blue-dark/60">
                  Réponse envoyée, en attente des autres…
                </p>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => submitAnswer(supabase, room.id, true))}
                    className="rounded-full bg-emerald-600 px-6 py-2 font-black text-white shadow-[0_3px_0_#047857] disabled:opacity-40"
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => submitAnswer(supabase, room.id, false))}
                    className="rounded-full bg-red-600 px-6 py-2 font-black text-white shadow-[0_3px_0_#b91c1c] disabled:opacity-40"
                  >
                    Non
                  </button>
                </div>
              )}
            </div>
          )}

          {room.turn_phase === "eliminate" &&
            (isMyTurn ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm font-bold text-pink-dark">
                  Élimine sur le plateau à gauche tous les personnages que tu penses exclus, puis
                  termine ton tour.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => endTurn(supabase, room.id))}
                  className="rounded-full bg-pink px-5 py-2 text-sm font-black text-white shadow-[0_3px_0_var(--pink-dark)] disabled:opacity-40"
                >
                  Terminer mon tour
                </button>
              </div>
            ) : (
              <p className="text-center text-sm font-bold text-blue-dark/60">
                {actorName} élimine des personnages sur son plateau…
              </p>
            ))}

          {isFinalRound && (
            <p className="text-center text-sm font-black text-pink-dark">
              {isMyTurn
                ? `⚡ Dernière chance ! Devine qui est ${boardPlayerName} sur le plateau à gauche.`
                : `Tour final : en attente de ${actorName}…`}
            </p>
          )}

          {error && <p className="mt-2 text-center text-sm font-bold text-red-600">{error}</p>}
        </section>

        {/* 4. Le chat */}
        <div className="order-3">
          <MessageLog
            messages={messages}
            playersById={playersById}
            onSendChat={(content) => sendChatMessage(supabase, room.id, myPlayer.id, content)}
          />
        </div>
      </div>
    </main>
  );
}
