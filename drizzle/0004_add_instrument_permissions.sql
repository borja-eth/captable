DO $$ 
DECLARE 
    permission_id uuid;
BEGIN
    -- Insert instrument permissions
    INSERT INTO "permission" (id, action, entity, description)
    VALUES 
        (gen_random_uuid(), 'read', 'instrument', 'Can read instruments'),
        (gen_random_uuid(), 'create', 'instrument', 'Can create instruments'),
        (gen_random_uuid(), 'update', 'instrument', 'Can update instruments'),
        (gen_random_uuid(), 'delete', 'instrument', 'Can delete instruments')
    RETURNING id INTO permission_id;

    -- Add permissions to admin role
    INSERT INTO "permissionsToRoles" ("permissionId", "roleId")
    SELECT p.id, r.id
    FROM "permission" p, "role" r
    WHERE p.entity = 'instrument' AND r.name = 'admin';
END $$; 