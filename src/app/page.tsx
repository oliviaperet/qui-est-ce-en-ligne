"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthUserId } from "@/lib/session";
import { createRoom, joinRoom } from "@/lib/game";
import { saveRoomIdentity } from "@/lib/roomStorage";

export default function HomePage() {
  const router = useRouter();
  const userId = useAuthUserId();

  const [hostName, setHostName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!userId || !hostName.trim() || busy) return;
    setBusy("create");
    setError(null);
    try {
      const supabase = createClient();
      const result = await createRoom(supabase, hostName.trim());
      saveRoomIdentity(result.room_code, {
        roomId: result.room_id,
        playerId: result.player_id,
      });
      router.push(`/room/${result.room_code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setBusy(null);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!userId || !joinName.trim() || !joinCode.trim() || busy) return;
    setBusy("join");
    setError(null);
    try {
      const supabase = createClient();
      const code = joinCode.trim().toUpperCase();
      const result = await joinRoom(supabase, code, joinName.trim());
      saveRoomIdentity(code, { roomId: result.room_id, playerId: result.player_id });
      router.push(`/room/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setBusy(null);
    }
  }

  const ready = Boolean(userId);

  return (
    <div className="relative flex-1 overflow-hidden bg-hero-pink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/flowers.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-64 opacity-25 sm:w-80"
      />
      <div className="pointer-events-none absolute -right-4 -top-6 flex w-[62%] max-w-md rotate-180 gap-0 sm:w-[46%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/face-star.png" alt="" className="w-1/3" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/face-glasses.png" alt="" className="w-1/3" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/face-cap.png" alt="" className="w-1/3" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/faces-grid.png"
        alt=""
        className="pointer-events-none absolute -bottom-8 -left-8 w-[55%] max-w-xs sm:w-[40%]"
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-4 py-24">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/title.png"
            alt="Bonne Gueule"
            className="mx-auto w-[85%] max-w-md sm:max-w-lg"
          />
          <p className="mt-4 font-bold text-ink/70">
            Importez vos photos, créez un salon, et devinez qui se cache derrière chaque bonne
            gueule.
          </p>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-2">
          <form
            onSubmit={handleCreate}
            className="game-card flex flex-col gap-4 border-pink p-6 shadow-[0_4px_0_var(--pink)]"
          >
            <div>
              <h2 className="text-lg font-black text-pink-dark">Créer une partie</h2>
              <p className="text-sm text-ink/60">
                Vous importerez les photos du plateau à l&apos;étape suivante.
              </p>
            </div>
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Votre prénom"
              maxLength={40}
              className="rounded-xl border-2 border-pink-tint bg-white px-3 py-2 outline-none focus:border-pink"
            />
            <button
              type="submit"
              disabled={!ready || !hostName.trim() || busy !== null}
              className="rounded-full bg-pink px-4 py-2.5 font-black text-white shadow-[0_3px_0_var(--pink-dark)] transition active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "create" ? "Création…" : "Créer une partie"}
            </button>
          </form>

          <form onSubmit={handleJoin} className="game-card flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-black text-blue-dark">Rejoindre une partie</h2>
              <p className="text-sm text-ink/60">Demandez le code à l&apos;ami qui a créé le salon.</p>
            </div>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Code du salon"
              maxLength={6}
              className="rounded-xl border-2 border-blue-tint bg-white px-3 py-2 uppercase tracking-widest outline-none focus:border-blue"
            />
            <input
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Votre prénom"
              maxLength={40}
              className="rounded-xl border-2 border-blue-tint bg-white px-3 py-2 outline-none focus:border-blue"
            />
            <button
              type="submit"
              disabled={!ready || !joinName.trim() || !joinCode.trim() || busy !== null}
              className="rounded-full bg-blue px-4 py-2.5 font-black text-white shadow-[0_3px_0_var(--blue-dark)] transition active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === "join" ? "Connexion…" : "Rejoindre"}
            </button>
          </form>
        </div>

        {error && (
          <p className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
