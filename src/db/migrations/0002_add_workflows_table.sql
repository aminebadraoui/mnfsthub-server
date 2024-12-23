CREATE TABLE IF NOT EXISTS "workflows" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "users"("id"),
    "n8n_workflow_id" varchar(256),
    "type" varchar(64) NOT NULL,
    "status" varchar(64) NOT NULL,
    "name" varchar(256) NOT NULL,
    "params" jsonb DEFAULT '{}',
    "result" jsonb DEFAULT '{}',
    "error" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
); 