CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "prep_time";
--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "cook_time";
--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "cuisine";
--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "tags";
--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "category";
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "difficulty" text;
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "category_id" integer;
--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
