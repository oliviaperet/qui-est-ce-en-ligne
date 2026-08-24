"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";

export function useAuthUserId() {
  const [supabase] = useState(() => createClient());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!cancelled) setUserId(data.session.user.id);
        return;
      }
      const { data: signInData, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Anonymous sign-in failed", error);
        return;
      }
      if (!cancelled && signInData.session) {
        setUserId(signInData.session.user.id);
      }
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return userId;
}
