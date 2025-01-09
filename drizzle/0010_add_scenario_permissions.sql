-- Add scenario permissions
INSERT INTO "permission" ("action", "entity", "description")
VALUES 
    ('list', 'scenario', 'List scenarios'),
    ('read', 'scenario', 'Read scenario details'),
    ('create', 'scenario', 'Create new scenarios'),
    ('update', 'scenario', 'Update existing scenarios'),
    ('delete', 'scenario', 'Delete scenarios'),
    ('manage', 'scenario', 'Full management of scenarios'),
    ('view', 'scenario', 'View scenarios')
ON CONFLICT ("action", "entity") DO NOTHING; 