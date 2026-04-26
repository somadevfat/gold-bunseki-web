"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/features/common/components/ToastProvider";

const researchNoteSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(60, "タイトルは60文字以内で入力してください"),
  note: z.string().min(10, "メモは10文字以上で入力してください").max(240, "メモは240文字以内で入力してください"),
});

type ResearchNoteFormValues = z.infer<typeof researchNoteSchema>;

/**
 * ResearchNoteForm は React Hook Form と zod を組み合わせたサンプルフォームです。
 * @responsibility 今後の設定画面や投稿フォームで再利用する入力検証・送信フィードバックの土台を示す。
 */
export function ResearchNoteForm() {
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
      note: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    showToast({
      title: "リサーチメモを保存しました",
      description: `${values.title} をローカル確認用のサンプルとして受け付けました。`,
      variant: "success",
    });
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Form Foundation
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">リサーチメモのサンプルフォーム</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          React Hook Form と zod による型安全な入力検証の基盤です。
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
          {...register("note")}
          className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
          placeholder="見返したい観点を10文字以上で入力"
        />
        {errors.note ? <p className="text-xs font-medium text-red-600">{errors.note.message}</p> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        メモを保存
      </button>
    </form>
  );
}
