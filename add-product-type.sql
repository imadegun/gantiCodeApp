-- Add ProductType enum
DO $$ BEGIN
    CREATE TYPE "ProductType" AS ENUM ('SINGLE_ITEM', 'SET_PRODUCT', 'COMPONENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add productType column to stocks table
ALTER TABLE "stocks" ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'SINGLE_ITEM';