-- Custom SQL migration

-- Add round permissions
INSERT INTO "permission" ("id", "action", "entity", "description") 
VALUES 
  (gen_random_uuid(), 'list', 'round', 'List all rounds'),
  (gen_random_uuid(), 'read', 'round', 'Read round details'),
  (gen_random_uuid(), 'create', 'round', 'Create new rounds'),
  (gen_random_uuid(), 'update', 'round', 'Update round details'),
  (gen_random_uuid(), 'delete', 'round', 'Delete rounds');

-- Add migration meta
INSERT INTO "drizzle_migrations" ("hash", "created_at")
VALUES ('0003_add_round_permissions', NOW()); 