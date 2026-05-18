"use client";

import { useEffect, useState } from "react";
import { getResearchNotes } from "@/features/forms/api/getResearchNotes";
import { ResearchNoteForm } from "@/features/forms/components/ResearchNoteForm";
import type { ResearchNote, ResearchNotesResponse } from "@/lib/api/client";

type ResearchNotesPanelProps = {
  loadNotes?: typeof getResearchNotes;
};

/**
 * formatResearchNoteDate は保存日時を短い日本語表記へ変換します。
 * @responsibility 一覧カードで読みやすい作成日時ラベルを生成する。
 */
export function formatResearchNoteDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * ResearchNotesPanel はメモ作成フォームと保存済みメモ一覧をまとめて表示します。
 * @responsibility 初期取得、ローディング/エラー/空状態、作成後の一覧反映を担当する。
 */
export function ResearchNotesPanel({ loadNotes = getResearchNotes }: ResearchNotesPanelProps) {
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response: ResearchNotesResponse = await loadNotes();
        if (isMounted) {
          setNotes(response.notes);
        }
      } catch {
        if (isMounted) {
          setError("リサーチメモを読み込めませんでした");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [loadNotes]);

  const handleCreated = (note: ResearchNote) => {
    setNotes((current) => [note, ...current]);
  };

  return (
    <div className="space-y-6">
      <ResearchNoteForm onCreated={handleCreated} />

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Saved Notes
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">保存済みリサーチメモ</h3>
        </div>

        {isLoading ? (
          <div className="space-y-3" aria-label="リサーチメモを読み込み中">
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            まだ保存済みメモはありません。
          </p>
        ) : null}

        {!isLoading && !error && notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <article key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold leading-6 text-slate-950">{note.title}</h4>
                  <time className="shrink-0 text-xs font-medium text-slate-400" dateTime={note.createdAt}>
                    {formatResearchNoteDate(note.createdAt)}
                  </time>
                </div>
                <p className="line-clamp-3 text-sm leading-6 text-slate-600">{note.body}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
