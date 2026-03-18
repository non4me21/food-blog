CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"ingredients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"directions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prep_time" integer,
	"cook_time" integer,
	"cuisine" text,
	"category" text,
	"tags" text[] DEFAULT '{}',
	"image_url" text,
	"published" boolean DEFAULT false,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug")
);
