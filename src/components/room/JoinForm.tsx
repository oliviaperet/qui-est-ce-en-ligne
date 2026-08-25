"use client";

import { useState, type FormEvent } from "react";
import { FaceCap, FaceCurly, FaceGrin, FaceStar } from "@/components/doodles/Faces";

export function JoinForm({
  code,
  onJoin,
}: {
  code: string;
  onJoin: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onJoin(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre ce salon.");
      setBusy(false);
    }
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-hero-pink">
      <div className="pointer-events-none absolute -right-6 -top-8 flex w-[55%] max-w-xs -rotate-180 gap-1">
        <FaceStar className="w-1/3" />
        <FaceGrin className="w-1/3" />
        <FaceCap className="w-1/3" />
      </div>
      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-24">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-widest text-pink-dark">Salon {code}</p>
          <h1 className="mt-2 text-3xl font-black uppercase text-blue">Rejoindre la partie</h1>
        </div>
        <form onSubmit={handleSubmit} className="game-card flex w-full flex-col gap-4 p-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre prénom"
            maxLength={40}
            autoFocus
            className="rounded-xl border-2 border-blue-tint bg-white px-3 py-2 outline-none focus:border-blue"
          />
          <button
            type="submit"
            disabled={!name.trim() || busy}
            className="rounded-full bg-pink px-4 py-2.5 font-black text-white shadow-[0_3px_0_var(--pink-dark)] transition active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Connexion…" : "Rejoindre"}
          </button>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </form>
        <FaceCurly className="pointer-events-none w-16 opacity-70" />
      </main>
    </div>
  );
}
