-- Add pgcrypto for UUID/random generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Add the column as nullable
ALTER TABLE "Device"
ADD COLUMN "publicToken" TEXT;

-- 2. Generate random TOKEN for existing rows
UPDATE "Device"
SET "publicToken" = substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
WHERE "publicToken" IS NULL;

-- 3. Make the column NOT NULL
ALTER TABLE "Device"
ALTER COLUMN "publicToken" SET NOT NULL;

-- 4. Add UNIQUE constraint
ALTER TABLE "Device"
ADD CONSTRAINT "Device_publicToken_key" UNIQUE ("publicToken");