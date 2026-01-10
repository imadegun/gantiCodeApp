-- Fix ProductType enum: Replace COMPONENT with UNSET

-- First, update any existing records that use COMPONENT to use UNSET
UPDATE "stocks" SET "productType" = 'UNSET' WHERE "productType" = 'COMPONENT';

-- Drop the old enum and create a new one
DROP TYPE IF EXISTS "ProductType";

-- Create the new enum with the correct values
CREATE TYPE "ProductType" AS ENUM ('SINGLE_ITEM', 'SET_PRODUCT', 'UNSET');

-- Make sure the stocks table uses the new enum type
ALTER TABLE "stocks" ALTER COLUMN "productType" TYPE "ProductType" USING "productType"::text::"ProductType";