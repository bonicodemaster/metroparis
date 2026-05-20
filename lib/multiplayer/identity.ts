"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "metro-paris-mp-identity";

const COLORS = [
  "#0064B0", "#C04191", "#F28E42", "#22c55e", "#662483",
  "#E3B32A", "#8D5E2A", "#00814F", "#9F9825", "#ef4444",
];

function randomAdj() {
  const adj = [
    "Rapide", "Furtif", "Vif", "Agile", "Audacieux", "Curieux",
    "Joyeux", "Brave", "Malin", "Tonique",
  ];
  return adj[Math.floor(Math.random() * adj.length)];
}
function randomNoun() {
  const nouns = [
    "Métro", "Wagon", "Pigeon", "Chat", "Renard", "Lapin",
    "Hibou", "Pingouin", "Tigre", "Loup",
  ];
  return nouns[Math.floor(Math.random() * nouns.length)];
}

export interface Identity {
  id: string;
  name: string;
  color: string;
}

function loadOrCreate(): Identity {
  if (typeof window === "undefined") {
    return { id: "anon", name: "Joueur", color: COLORS[0] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const id = "p_" + Math.random().toString(36).slice(2, 10);
  const name = `${randomAdj()} ${randomNoun()}`;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const identity = { id, name, color };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {}
  return identity;
}

function save(identity: Identity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {}
}

/** Hook React qui expose une identité locale persistée. */
export function useIdentity() {
  const [identity, setIdentityState] = useState<Identity | null>(null);

  useEffect(() => {
    setIdentityState(loadOrCreate());
  }, []);

  const setName = (name: string) => {
    setIdentityState((cur) => {
      if (!cur) return cur;
      const next = { ...cur, name: name.trim().slice(0, 24) || cur.name };
      save(next);
      return next;
    });
  };
  const setColor = (color: string) => {
    setIdentityState((cur) => {
      if (!cur) return cur;
      const next = { ...cur, color };
      save(next);
      return next;
    });
  };

  return { identity, setName, setColor, COLORS };
}

export function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
