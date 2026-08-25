"use client";

import type { CharacterRow } from "@/lib/useRoomState";

export function CharacterThumb({
  character,
  crossedOut = false,
  highlighted = false,
  onClick,
  onToggleEliminate,
  badge,
}: {
  character: CharacterRow;
  crossedOut?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  onToggleEliminate?: () => void;
  badge?: string;
}) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group relative block aspect-square w-full overflow-hidden rounded-2xl border-[3px] bg-blue-tint text-left transition ${
        highlighted ? "border-amber-400 shadow-[0_3px_0_#d97706]" : "border-blue shadow-[0_3px_0_var(--blue)]"
      } ${crossedOut ? "opacity-50 saturate-50" : ""} ${
        onClick ? "cursor-pointer active:translate-y-0.5 active:shadow-none" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.image_path}
        alt={character.name || "Personnage"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {badge && (
        <span className="absolute left-1 top-1 rounded-full bg-pink px-2 py-0.5 text-[10px] font-black text-white">
          {badge}
        </span>
      )}
      {onToggleEliminate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleEliminate();
          }}
          aria-label={crossedOut ? "Remettre en jeu" : "Éliminer"}
          className={`absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-base font-black shadow transition active:scale-90 ${
            crossedOut ? "bg-slate-300 text-white" : "bg-pink text-white"
          }`}
        >
          ✕
        </button>
      )}
    </Tag>
  );
}
