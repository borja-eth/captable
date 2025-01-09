ALTER TABLE "companies" 
ADD COLUMN "shares" integer NOT NULL DEFAULT 10000000;

-- Update existing companies to have the default value
UPDATE "companies" SET "shares" = 10000000 WHERE "shares" IS NULL; 
