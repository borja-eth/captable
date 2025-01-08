-- Add permissions for cap table functionality
INSERT INTO "permission" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'company:read', 'Read company information', NOW(), NOW()),
  (gen_random_uuid(), 'instrument:read', 'Read instrument information', NOW(), NOW()),
  (gen_random_uuid(), 'round:read', 'Read round information', NOW(), NOW());

-- Get the admin role ID
WITH admin_role AS (
  SELECT id FROM "role" WHERE name = 'admin' LIMIT 1
),
-- Get the permission IDs
company_read AS (
  SELECT id FROM "permission" WHERE name = 'company:read' LIMIT 1
),
instrument_read AS (
  SELECT id FROM "permission" WHERE name = 'instrument:read' LIMIT 1
),
round_read AS (
  SELECT id FROM "permission" WHERE name = 'round:read' LIMIT 1
)
-- Assign permissions to admin role
INSERT INTO "permissionsToRoles" ("id", "roleId", "permissionId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  admin_role.id,
  permission_id,
  NOW(),
  NOW()
FROM admin_role
CROSS JOIN (
  SELECT id as permission_id FROM company_read
  UNION ALL
  SELECT id FROM instrument_read
  UNION ALL
  SELECT id FROM round_read
) permissions; 