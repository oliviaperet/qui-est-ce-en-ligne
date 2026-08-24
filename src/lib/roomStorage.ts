export type StoredIdentity = { roomId: string; playerId: string };

function storageKey(code: string) {
  return `qec:player:${code.toUpperCase()}`;
}

export function saveRoomIdentity(code: string, value: StoredIdentity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(code), JSON.stringify(value));
}

export function loadRoomIdentity(code: string): StoredIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey(code));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredIdentity;
  } catch {
    return null;
  }
}

export function clearRoomIdentity(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(code));
}
