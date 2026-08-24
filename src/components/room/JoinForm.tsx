"use client";

import { useState, type FormEvent } from "react";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-widest text-pink">Salon {code}</p>
        <h1 className="mt-2 text-2xl font-black text-blue-dark">Rejoindre la partie</h1>
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
    </main>
  );
}
