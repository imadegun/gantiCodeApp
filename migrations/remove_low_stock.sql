-- Migration script to remove low_stock status
-- First, update any stocks with low_stock status to available
UPDATE stocks SET status = 'available' WHERE status = 'low_stock';
UPDATE stock_by_client_code SET status = 'available' WHERE status = 'low_stock';
UPDATE stock_by_design_code SET status = 'available' WHERE status = 'low_stock';
UPDATE stock_entries SET status = 'available' WHERE status = 'low_stock';

-- Then drop the low_stock value from the enum
ALTER TYPE "StockStatus" RENAME TO "StockStatus_old";
CREATE TYPE "StockStatus" AS ENUM ('available', 'out_of_stock');
ALTER TABLE stocks ALTER COLUMN status TYPE "StockStatus" USING status::text::"StockStatus";
ALTER TABLE stock_by_client_code ALTER COLUMN status TYPE "StockStatus" USING status::text::"StockStatus";
ALTER TABLE stock_by_design_code ALTER COLUMN status TYPE "StockStatus" USING status::text::"StockStatus";
ALTER TABLE stock_entries ALTER COLUMN status TYPE "StockStatus" USING status::text::"StockStatus";
DROP TYPE "StockStatus_old";
