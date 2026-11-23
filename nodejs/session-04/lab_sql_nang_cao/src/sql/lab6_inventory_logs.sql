-- Lab 6 (nâng cao): nhật ký kho. Đọc Lab 6 trong lab_guide.md.
-- Đầu ra: bảng inventory_logs (id, product_id, old_stock, new_stock, changed_at) và trigger
--   trg_products_stock_log chạy sau mỗi lần sửa hàng của products, chỉ ghi khi stock đổi.
DROP TRIGGER IF EXISTS trg_products_stock_log;
DROP TABLE IF EXISTS inventory_logs;

-- CREATE TABLE inventory_logs: chưa làm.

-- CREATE TRIGGER trg_products_stock_log: chưa làm.
