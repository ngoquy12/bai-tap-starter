-- N4 (Mức AI: AI-0): hai trigger giữ orders.total khớp với order_items.
-- Tệp gửi một lần bằng mysql2 nên KHÔNG dùng DELIMITER.
DROP TRIGGER IF EXISTS trg_order_items_after_insert;
DROP TRIGGER IF EXISTS trg_order_items_after_delete;

-- Chạy sau khi thêm một hàng order_items.
-- Đầu vào: NEW (hàng vừa thêm). Đầu ra: total của đơn chứa hàng đó tăng thêm thành tiền của hàng.
CREATE TRIGGER trg_order_items_after_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
END;

-- Chạy sau khi xóa một hàng order_items.
-- Đầu vào: OLD (hàng vừa xóa). Đầu ra: total của đơn chứa hàng đó giảm đi thành tiền của hàng.
CREATE TRIGGER trg_order_items_after_delete
AFTER DELETE ON order_items
FOR EACH ROW
BEGIN
END;
