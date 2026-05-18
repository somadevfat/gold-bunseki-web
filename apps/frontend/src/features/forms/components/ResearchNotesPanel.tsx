"use client";

import { useEffect, useState } from "react";
import { deleteResearchNote } from "@/features/forms/api/deleteResearchNote";
import { getResearchNotes } from "@/features/forms/api/getResearchNotes";
import { updateResearchNote } from "@/features/forms/api/updateResearchNote";
import { useToast } from "@/features/common/components/ToastProvider";
import {
  ResearchNoteForm,
  researchNoteSchema,
  type ResearchNoteFormValues,
} from "@/features/forms/components/ResearchNoteForm";
import type { ResearchNote, ResearchNotesResponse, UpdateResearchNoteInput } from "@/lib/api/client";

type ResearchNotesPanelProps = {
  loadNotes?: typeof getResearchNotes;
  updateNote?: typeof updateResearchNote;
  deleteNote?: typeof deleteResearchNote;
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
export function ResearchNotesPanel({
  loadNotes = getResearchNotes,
  updateNote = updateResearchNote,
  deleteNote = deleteResearchNote,
}: ResearchNotesPanelProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [editValues, setEditValues] = useState<ResearchNoteFormValues>({
    title: "",
    body: "",
  });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof ResearchNoteFormValues, string>>>({});
  const [deletingNote, setDeletingNote] = useState<ResearchNote | null>(null);
  const [isMutating, setIsMutating] = useState(false);

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

  const startEditing = (note: ResearchNote) => {
    setEditingNote(note);
    setEditValues({
      title: note.title,
      body: note.body,
    });
    setEditErrors({});
  };

  const submitEdit = async () => {
    if (!editingNote) return;

    const parsed = researchNoteSchema.safeParse(editValues);
    if (!parsed.success) {
      setEditErrors({
        title: parsed.error.flatten().fieldErrors.title?.[0],
        body: parsed.error.flatten().fieldErrors.body?.[0],
      });
      return;
    }

    try {
      setIsMutating(true);
      const updated = await updateNote(editingNote.id, parsed.data as UpdateResearchNoteInput);
      setNotes((current) => current.map((note) => (note.id === updated.id ? updated : note)));
      setEditingNote(null);
      showToast({
        title: "リサーチメモを更新しました",
        description: `${updated.title} を更新しました。`,
        variant: "success",
      });
    } catch {
      showToast({
        title: "リサーチメモを更新できませんでした",
        description: "入力内容を確認して、時間をおいて再度お試しください。",
        variant: "error",
      });
    } finally {
      setIsMutating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingNote) return;

    try {
      setIsMutating(true);
      await deleteNote(deletingNote.id);
      setNotes((current) => current.filter((note) => note.id !== deletingNote.id));
      showToast({
        title: "リサーチメモを削除しました",
        description: `${deletingNote.title} を削除しました。`,
        variant: "success",
      });
      setDeletingNote(null);
    } catch {
      showToast({
        title: "リサーチメモを削除できませんでした",
        description: "時間をおいて再度お試しください。",
        variant: "error",
      });
    } finally {
      setIsMutating(false);
    }
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
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(note)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-400"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingNote(note)}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
                  >
                    削除
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {editingNote ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="edit-research-note-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 id="edit-research-note-title" className="text-lg font-semibold text-slate-950">リサーチメモを編集</h3>
            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">タイトル</span>
                <input
                  value={editValues.title}
                  onChange={(event) => setEditValues((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
                />
                {editErrors.title ? <p className="text-xs font-medium text-red-600">{editErrors.title}</p> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">メモ</span>
                <textarea
                  value={editValues.body}
                  onChange={(event) => setEditValues((current) => ({ ...current, body: event.target.value }))}
                  className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
                />
                {editErrors.body ? <p className="text-xs font-medium text-red-600">{editErrors.body}</p> : null}
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingNote(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                キャンセル
              </button>
              <button type="button" onClick={submitEdit} disabled={isMutating} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isMutating ? "更新中..." : "更新する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingNote ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-research-note-title" className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 id="delete-research-note-title" className="text-lg font-semibold text-slate-950">リサーチメモを削除しますか？</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {deletingNote.title} は削除後に戻せません。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingNote(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                キャンセル
              </button>
              <button type="button" onClick={confirmDelete} disabled={isMutating} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isMutating ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
