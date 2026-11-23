-- Phần A (Mức AI: AI-0): ba bảng của mô-đun mã giảm giá và một chỉ mục.
-- Tệp chạy trên cơ sở dữ liệu đã có db/schema.sql và db/seed.sql, gửi một lần bằng mysql2 (không dùng DELIMITER).
-- Cột, kiểu, ràng buộc và hành vi khi xóa của từng bảng: bảng ở Phần A của đề bài.

-- Bảng coupons: id, code, discount_type, discount_value, max_uses, used_count, expires_at.

-- Bảng coupon_categories: coupon_id, category_id (quan hệ n-n giữa coupons và categories).

-- Bảng coupon_redemptions: id, coupon_id, order_id, discount_amount, redeemed_at.

-- Chỉ mục idx_redemptions_coupon_date trên coupon_redemptions (coupon_id, redeemed_at).
