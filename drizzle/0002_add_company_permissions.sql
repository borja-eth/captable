-- Custom SQL migration

-- Add company permissions
INSERT INTO "permission" ("id", "action", "entity", "description") 
VALUES 
  (gen_random_uuid(), 'list', 'company', 'List all companies'),
  (gen_random_uuid(), 'read', 'company', 'Read company details'),
  (gen_random_uuid(), 'create', 'company', 'Create new companies'),
  (gen_random_uuid(), 'update', 'company', 'Update company details'),
  (gen_random_uuid(), 'delete', 'company', 'Delete companies');

-- Add migration meta
INSERT INTO "drizzle_migrations" ("hash", "created_at")
VALUES ('0002_add_company_permissions', NOW()); 