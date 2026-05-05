"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCommunityThread } from "@/features/community/api/createCommunityThread";
import { useToast } from "@/features/common/components/ToastProvider";
import type { CommunityThread } from "@/lib/api/client";

const categoryOptions = ["Market Discussion", "Event Watch", "Trade Review", "General"] as const;

const communityPostSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください").max(200, "タイトルは200文字以内で入力してください"),
  body: z.string().trim().min(1, "本文を入力してください").max(5000, "本文は5000文字以内で入力してください"),
  category: z.enum(categoryOptions),
});

type CommunityPostFormValues = z.infer<typeof communityPostSchema>;

type CommunityPostFormProps = {
  onCreated: (thread: CommunityThread) => void;
};

/**
 * CommunityPostForm renders the new community thread form.
 * @responsibility Validate user input, submit it to the community API, and surface success or failure feedback.
 */
export function CommunityPostForm({ onCreated }: CommunityPostFormProps) {
  const { showToast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CommunityPostFormValues>({
    resolver: zodResolver(communityPostSchema),
    defaultValues: {
      title: "",
      body: "",
      category: "Market Discussion",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const thread = await createCommunityThread(values);
      onCreated(thread);
      reset();
      showToast({
        title: "投稿しました",
        description: "掲示板の先頭に新しい投稿を追加しました。",
        variant: "success",
      });
    } catch {
      showToast({
        title: "投稿できませんでした",
        description: "入力内容を確認して、時間をおいて再度お試しください。",
        variant: "error",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">New Thread</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">新しい投稿を作成</h3>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">タイトル</span>
        <input
          {...register("title")}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
          placeholder="例: CPI発表後のXAUUSD反応"
        />
        {errors.title ? <p className="text-xs font-medium text-red-600">{errors.title.message}</p> : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">カテゴリ</span>
        <select
          {...register("category")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500"
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">本文</span>
        <textarea
          {...register("body")}
          className="min-h-36 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-amber-500"
          placeholder="見ている値動き、根拠、気になる時間帯などを共有してください。"
        />
        {errors.body ? <p className="text-xs font-medium text-red-600">{errors.body.message}</p> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}
