"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCommunityReply } from "@/features/community/api/createCommunityReply";
import { useToast } from "@/features/common/components/ToastProvider";
import type { CommunityReply } from "@/lib/api/client";

const communityReplySchema = z.object({
  body: z.string().trim().min(1, "返信本文を入力してください").max(5000, "返信本文は5000文字以内で入力してください"),
});

type CommunityReplyFormValues = z.infer<typeof communityReplySchema>;

type CommunityReplyFormProps = {
  threadId: string;
  onCreated: (reply: CommunityReply) => void;
  createReply?: typeof createCommunityReply;
};

/**
 * CommunityReplyForm は掲示板スレッドへの返信フォームです。
 * @responsibility 入力検証、返信API呼び出し、成功・失敗通知を担当する。
 */
export function CommunityReplyForm({ createReply = createCommunityReply, onCreated, threadId }: CommunityReplyFormProps) {
  const { showToast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CommunityReplyFormValues>({
    resolver: zodResolver(communityReplySchema),
    defaultValues: {
      body: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const reply = await createReply(threadId, values);
      onCreated(reply);
      reset();
      showToast({
        title: "返信しました",
        description: "スレッドに返信を追加しました。",
        variant: "success",
      });
    } catch {
      showToast({
        title: "返信できませんでした",
        description: "入力内容を確認して、時間をおいて再度お試しください。",
        variant: "error",
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Reply</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">返信を投稿</h3>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">返信本文</span>
        <textarea
          {...register("body")}
          className="min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-amber-500"
          placeholder="値動きの見方や追加の観点を共有してください。"
        />
        {errors.body ? <p className="text-xs font-medium text-red-600">{errors.body.message}</p> : null}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "返信中..." : "返信する"}
      </button>
    </form>
  );
}
