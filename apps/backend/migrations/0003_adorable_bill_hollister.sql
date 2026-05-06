CREATE TABLE "community_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "community_replies" ADD CONSTRAINT "community_replies_thread_id_community_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."community_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_replies_thread_created" ON "community_replies" USING btree ("thread_id","created_at");