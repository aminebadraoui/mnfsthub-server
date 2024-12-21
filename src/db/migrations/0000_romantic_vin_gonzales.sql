CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(256) NOT NULL UNIQUE,
	"password" varchar(256) NOT NULL,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(256) NOT NULL,
	"description" text,
	"tags" jsonb DEFAULT '[]',
	"tenant_id" uuid NOT NULL REFERENCES "users"("id"),
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(256) NOT NULL,
	"description" text,
	"status" varchar(64) NOT NULL,
	"channels" jsonb DEFAULT '[]',
	"list_id" uuid REFERENCES "lists"("id"),
	"tenant_id" uuid NOT NULL REFERENCES "users"("id"),
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"tenant_id" uuid NOT NULL REFERENCES "users"("id"),
	"full_name" varchar(256) NOT NULL,
	"first_name" varchar(128),
	"last_name" varchar(128),
	"location" varchar(256),
	"job_title" varchar(256),
	"company" varchar(256),
	"email" varchar(256),
	"phone" varchar(64),
	"linkedin" varchar(256),
	"facebook" varchar(256),
	"twitter" varchar(256),
	"instagram" varchar(256),
	"whatsapp" varchar(64),
	"tiktok" varchar(256),
	"employee_number" varchar(64),
	"industry" varchar(256),
	"list_name" varchar(256),
	"list_id" uuid REFERENCES "lists"("id"),
	"campaigns" jsonb DEFAULT '[]',
	"last_campaign" uuid REFERENCES "campaigns"("id"),
	"contact_channels" jsonb DEFAULT '[]',
	"last_contact_channel" varchar(64),
	"last_contacted_at" timestamp,
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);
