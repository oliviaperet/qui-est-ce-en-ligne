"use client";

import { useState, type ChangeEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CharacterRow, Player, Room } from "@/lib/useRoomState";
import { addCharacter, deleteCharacter, startGame, uploadCharacterPhoto } from "@/lib/game";
import { CharacterThumb } from "./CharacterThumb";
import { PlayerList } from "./PlayerList";

type StagedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
};

export function Lobby({
  supabase,
  room,
  players,
  characters,
  myPlayer,
}: {
  supabase: SupabaseClient<Database>;
  room: Room;
  players: Player[];
  characters: CharacterRow[];
  myPlayer: Player;
}) {
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/room/${room.code}` : "";

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const additions = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, ""),
    }));
    setStaged((prev) => [...prev, ...additions]);
  }

  function updateStagedName(id: string, name: string) {
    setStaged((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const found = prev.find((s) => s.id === id);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  async function handleConfirmStaged() {
    if (staged.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      let sortOrder = characters.length;
      for (const item of staged) {
        const publicUrl = await uploadCharacterPhoto(supabase, room.id, item.file);
        await addCharacter(supabase, room.id, item.name.trim() || "Personnage", publicUrl, sortOrder);
        sortOrder += 1;
        URL.revokeObjectURL(item.previewUrl);
      }
      setStaged([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'import des photos.");
    } finally {
      setUploading(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      await startGame(supabase, room.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de démarrer la partie.");
      setStarting(false);
    }
  }

  const canStart = players.length >= 2 && characters.length >= players.length;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-bold text-pink">Salon</p>
        <h1 className="text-4xl font-black tracking-[0.3em] text-blue-dark">{room.code}</h1>
        {shareUrl && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(shareUrl)}
            className="mt-1 text-xs font-bold text-pink underline"
          >
            Copier le lien à partager
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section className="game-card border-blue p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black text-blue-dark">Plateau de personnages ({characters.length})</h2>
            {myPlayer.is_host && (
              <label className="cursor-pointer rounded-full bg-pink px-3 py-1.5 text-sm font-black text-white shadow-[0_3px_0_var(--pink-dark)] active:translate-y-0.5 active:shadow-none">
                Importer des photos
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </label>
            )}
          </div>

          {staged.length > 0 && (
            <div className="mb-4 rounded-2xl border-2 border-dashed border-pink bg-pink-tint/40 p-3">
              <p className="mb-2 text-sm font-bold text-pink-dark">
                Donnez un prénom à chaque personnage avant de l&apos;ajouter au plateau :
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {staged.map((item) => (
                  <div key={item.id} className="relative flex flex-col gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="aspect-square w-full rounded-xl border-2 border-pink object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeStaged(item.id)}
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white"
                      aria-label="Retirer cette photo"
                    >
                      ✕
                    </button>
                    <input
                      value={item.name}
                      onChange={(e) => updateStagedName(item.id, e.target.value)}
                      placeholder="Prénom"
                      maxLength={40}
                      className="w-full rounded-lg border-2 border-pink-tint bg-white px-2 py-1 text-xs outline-none focus:border-pink"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleConfirmStaged}
                disabled={uploading}
                className="mt-3 w-full rounded-full bg-pink px-4 py-2 text-sm font-black text-white shadow-[0_3px_0_var(--pink-dark)] disabled:opacity-50"
              >
                {uploading
                  ? "Import en cours…"
                  : `Ajouter ${staged.length} personnage${staged.length > 1 ? "s" : ""} au plateau`}
              </button>
            </div>
          )}

          {characters.length === 0 && staged.length === 0 && (
            <p className="py-10 text-center text-sm text-blue-dark/50">
              {myPlayer.is_host
                ? "Importez au moins autant de photos que de joueurs pour pouvoir démarrer."
                : "En attente que l'hôte importe les photos du plateau…"}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {characters.map((c) => (
              <div key={c.id} className="relative">
                <CharacterThumb character={c} />
                {myPlayer.is_host && (
                  <button
                    type="button"
                    onClick={() => deleteCharacter(supabase, c.id)}
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white"
                    aria-label={`Retirer ${c.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="game-card border-pink p-4">
            <h2 className="mb-3 font-black text-pink-dark">Joueurs ({players.length})</h2>
            <PlayerList
              players={players}
              myPlayerId={myPlayer.id}
              identitiesByPlayerId={{}}
              charactersById={{}}
            />
          </div>

          {myPlayer.is_host ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || starting}
              className="rounded-full bg-blue px-4 py-3 font-black text-white shadow-[0_4px_0_var(--blue-dark)] transition active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              {starting
                ? "Lancement…"
                : canStart
                  ? "Démarrer la partie"
                  : `Il faut au moins ${Math.max(players.length, 2)} personnages et 2 joueurs`}
            </button>
          ) : (
            <p className="rounded-full bg-blue-tint px-4 py-3 text-center text-sm font-bold text-blue-dark">
              En attente que l&apos;hôte lance la partie…
            </p>
          )}
        </section>
      </div>

      {error && (
        <p className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/moodboard.png"
        alt="Aller chop chop chop"
        className="pointer-events-none mx-auto mt-6 w-full max-w-2xl"
      />
    </main>
  );
}
