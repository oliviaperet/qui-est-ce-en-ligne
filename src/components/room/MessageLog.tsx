"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Message, Player } from "@/lib/useRoomState";

function MessageLine({ message, playersById }: { message: Message; playersById: Record<string, Player> }) {
  const senderName = message.sender_player_id
    ? playersById[message.sender_player_id]?.name ?? "?"
    : null;

  switch (message.type) {
    case "system":
      return <p className="text-center text-xs font-bold italic text-blue-dark/70">{message.content}</p>;
    case "question":
      return (
        <p className="text-sm">
          <span className="font-black text-blue-dark">{senderName} demande :</span> « {message.content} »
        </p>
      );
    case "answer": {
      const value = (message.meta as { value?: boolean } | null)?.value;
      return (
        <p className="pl-4 text-sm">
          <span className="font-bold">{senderName} :</span>{" "}
          <span className={value ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
            {message.content}
          </span>
        </p>
      );
    }
    case "guess": {
      const correct = (message.meta as { correct?: boolean } | null)?.correct;
      const finalRound = (message.meta as { final_round?: boolean } | null)?.final_round;
      return (
        <p
          className={`rounded-lg px-2 py-1 text-sm font-bold ${
            correct ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {finalRound ? "⚡ " : ""}
          {message.content}
        </p>
      );
    }
    default:
      return (
        <p className="text-sm">
          <span className="font-bold">{senderName} :</span> {message.content}
        </p>
      );
  }
}

export function MessageLog({
  messages,
  playersById,
  onSendChat,
}: {
  messages: Message[];
  playersById: Record<string, Player>;
  onSendChat?: (content: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !onSendChat || sending) return;
    setSending(true);
    try {
      await onSendChat(draft.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="game-card flex h-full flex-col border-blue">
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-blue-dark/50">Aucun message pour le moment.</p>
        )}
        {messages.map((m) => (
          <MessageLine key={m.id} message={m} playersById={playersById} />
        ))}
        <div ref={bottomRef} />
      </div>
      {onSendChat && (
        <form onSubmit={handleSubmit} className="flex gap-2 border-t-2 border-blue-tint p-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrire un message…"
            maxLength={300}
            className="flex-1 rounded-full border-2 border-blue-tint bg-white px-3 py-1.5 text-sm outline-none focus:border-blue"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="rounded-full bg-blue px-3 py-1.5 text-sm font-black text-white disabled:opacity-40"
          >
            Envoyer
          </button>
        </form>
      )}
    </div>
  );
}
