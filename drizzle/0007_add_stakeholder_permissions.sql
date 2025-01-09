-- Add stakeholder permissions
INSERT INTO permission (id, action, entity, description)
VALUES 
    (gen_random_uuid(), 'stakeholder:list', 'list', 'List all stakeholders'),
    (gen_random_uuid(), 'stakeholder:read', 'read', 'Read stakeholder details'),
    (gen_random_uuid(), 'stakeholder:create', 'create', 'Create new stakeholders'),
    (gen_random_uuid(), 'stakeholder:update', 'update', 'Update existing stakeholders'),
    (gen_random_uuid(), 'stakeholder:delete', 'delete', 'Delete stakeholders')
