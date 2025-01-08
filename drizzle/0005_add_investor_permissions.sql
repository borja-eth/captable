DO $$ 
DECLARE 
    permission_id uuid;
BEGIN
    -- Insert investor permissions
    INSERT INTO "permission" (id, action, entity, description)
    VALUES 
        (gen_random_uuid(), 'list', 'investor', 'Can list investors'),
        (gen_random_uuid(), 'read', 'investor', 'Can read investors'),
        (gen_random_uuid(), 'create', 'investor', 'Can create investors'),
        (gen_random_uuid(), 'update', 'investor', 'Can update investors'),
        (gen_random_uuid(), 'delete', 'investor', 'Can delete investors')
    RETURNING id INTO permission_id;

    -- Add permissions to admin role
    INSERT INTO "permissionsToRoles" ("permissionId", "roleId")
    SELECT p.id, r.id
    FROM "permission" p, "role" r
    WHERE p.entity = 'investor' AND r.name = 'admin';
END $$; 