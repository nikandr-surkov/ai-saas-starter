DROP INDEX "generations_user_id_idx";--> statement-breakpoint
CREATE INDEX "generations_user_id_created_at_idx" ON "generations" USING btree ("user_id","created_at" DESC NULLS LAST);