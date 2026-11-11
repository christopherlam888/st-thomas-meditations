"use client";

import { useEffect, useState } from "react";
import type { MeditationMeta } from "@/lib/liturgical";

export interface Meditation extends MeditationMeta {
  epigraph: string | null;
  paragraphs: string[];
  /** 1-based page of the 1941 scan */
  page: number;
}

export interface Retreat {
  title: string;
  epigraph: string | null;
  paragraphs: string[];
}

export interface Prayer {
  title: string;
  category: "before" | "after";
  lines: string[];
}

export interface BookMeta {
  title: string;
  bookTitle: string;
  subtitle: string;
  author: string;
  adaptedFrom: string;
  publisher: string;
  year: string;
  copyright: string;
  nihilObstat: string;
  dedication: string;
}

export interface BookData {
  meta: BookMeta;
  meditations: Meditation[];
  retreats: Retreat[];
  prayers: Prayer[];
  referencesNote: string[];
}

let cache: BookData | null = null;
let pending: Promise<BookData> | null = null;

export function useBook(): { data: BookData | null; error: string | null } {
  const [data, setData] = useState<BookData | null>(cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    if (!pending) {
      pending = fetch("book.json").then((r) => {
        if (!r.ok) throw new Error(`Failed to load the book (${r.status}).`);
        return r.json() as Promise<BookData>;
      });
    }
    pending
      .then((d) => {
        cache = d;
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        pending = null;
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load the book.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error };
}
