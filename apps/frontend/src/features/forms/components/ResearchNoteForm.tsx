"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/features/common/components/ToastProvider";
import { createResearchNote } from "@/features/forms/api/createResearchNote";
import type { ResearchNote } from "@/lib/api/client";

export const researchNoteSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(60, "タイトルは60文字以内で入力してください"),
  body: z.string().min(10, "メモは10文字以上で入力してください").max(240, "メモは240文字以内で入力してください"),
});

export type ResearchNoteFormValues = z.infer<typeof researchNoteSchema>;

type ResearchNoteFormProps = {
  createNote?: typeof createResearchNote;
  onCreated?: (note: ResearchNote) => void;
};

/**
 * ResearchNoteForm はリサーチメモを保存するフォームです。
 * @responsibility 入力検証、保存API呼び出し、成功・失敗の通知を担当する。
 */
export function ResearchNoteForm({ createNote = createResearchNote, onCreated }: ResearchNoteFormProps) {
  const { showToast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ResearchNoteFormValues>({
    resolver: zodResolver(researchNoteSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const note = await createNote(values);
      onCreated?.(note);
      showToast({
        title: "リサーチメモを保存しました",
        description: `${note.title} を保存しました。`,
        variant: "success",
      });
      reset();
    } catch {
      showToast({
        title: "リサーチメモを保存できませんでした",
        description: "入力内容を確認して、時間をおいて再度お試しください。",
        variant: "error",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Research Notes
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">リサーチメモを保存</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          指標前後の気づきや検証したい仮説を残します。
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">タイトル</span>
        <input
          {...register("title")}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
          placeholder="例: CPI前後の値動き"
        />
        {errors.title ? <p className="text-xs font-medium text-red-600">{errors.title.message}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">メモ</span>
        <textarea
          {...register("body")}
          className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
          placeholder="見返したい観点を10文字以上で入力"
        />
        {errors.body ? <p className="text-xs font-medium text-red-600">{errors.body.message}</p> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "保存中..." : "メモを保存"}
      </button>
    </form>
  );
}
