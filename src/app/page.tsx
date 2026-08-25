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

  const scatter: { src: string; className: string }[] = [
    { src: "face-cap", className: "top-[-8%] left-[-6%] w-40 rotate-[12deg] sm:w-52" },
    { src: "flowers", className: "top-[-4%] left-[16%] w-40 rotate-[-8deg] opacity-30 sm:w-56" },
    { src: "face-star", className: "top-[-6%] right-[26%] w-32 rotate-[168deg] sm:w-40" },
    { src: "face-glasses", className: "top-[-8%] right-[2%] w-40 rotate-[188deg] sm:w-52" },
    { src: "face-1", className: "top-[3%] right-[42%] w-28 rotate-[172deg] sm:w-36" },
    { src: "flowers", className: "top-[6%] right-[-6%] w-44 rotate-[15deg] opacity-25 sm:w-56" },
    { src: "face-3", className: "top-[20%] left-[-8%] w-36 rotate-[-10deg] sm:w-44" },
    { src: "face-2", className: "top-[18%] right-[-5%] w-36 rotate-[9deg] sm:w-44" },
    { src: "flowers", className: "top-[30%] left-[6%] w-36 rotate-[204deg] opacity-20 sm:w-44" },
    { src: "face-glasses", className: "top-[36%] right-[-4%] w-40 rotate-[-16deg] sm:w-48" },
    { src: "face-star", className: "top-[42%] left-[-6%] w-32 rotate-[22deg] sm:w-40" },
    { src: "faces-grid", className: "bottom-[-6%] left-[-8%] w-64 rotate-[-6deg] sm:w-80" },
    { src: "face-cap", className: "bottom-[-4%] right-[-4%] w-40 rotate-[10deg] sm:w-48" },
    { src: "face-star", className: "bottom-[8%] right-[18%] w-32 rotate-[-12deg] sm:w-40" },
    { src: "flowers", className: "bottom-[4%] left-[32%] w-40 rotate-[5deg] opacity-25 sm:w-52" },
    { src: "face-1", className: "bottom-[20%] left-[-6%] w-32 rotate-[15deg] sm:w-40" },
  ];

  return (
    <div className="relative flex-1 overflow-hidden bg-hero-pink">
      {scatter.map((d, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={`/brand/${d.src}.png`}
          alt=""
          className={`pointer-events-none absolute ${d.className}`}
        />
      ))}

      <div className="relative mx-auto w-full max-w-5xl px-4 pt-24 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/title.png" alt="Bonne Gueule" className="mx-auto w-full" />
        <p className="mt-4 inline-block rounded-full bg-white/70 px-4 py-1 font-bold text-ink/80 backdrop-blur-sm">
          Importez vos photos, créez un salon, et devinez qui se cache derrière chaque bonne
          gueule.
        </p>
      </div>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-4 pb-24 pt-10">
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
