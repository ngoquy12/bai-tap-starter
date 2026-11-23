-- Phần C2 (Mức AI: AI-0): trigger hoàn lượt và view số tiền phải trả.
-- Tệp gửi một lần bằng mysql2 nên KHÔNG dùng DELIMITER.
DROP TRIGGER IF EXISTS trg_coupon_redemptions_after_delete;
DROP VIEW IF EXISTS v_order_payments;

-- Trigger chạy sau khi xóa một hàng của coupon_redemptions.
-- Đầu vào: OLD (hàng vừa bị xóa). Đầu ra: used_count của mã tương ứng giảm 1.
CREATE TRIGGER trg_coupon_redemptions_after_delete
AFTER DELETE ON coupon_redemptions
FOR EACH ROW
BEGIN
END;

-- View v_order_payments: mỗi đơn hàng một hàng.
-- Cột theo thứ tự: order_id, customer_name, total, coupon_code, discount_amount, payable.
