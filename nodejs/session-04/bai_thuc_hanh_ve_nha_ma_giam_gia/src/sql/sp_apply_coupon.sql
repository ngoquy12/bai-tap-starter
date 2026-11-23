-- Phần C1 (Mức AI: AI-0): procedure áp một mã giảm giá cho một đơn hàng.
-- Tệp gửi một lần bằng mysql2 nên KHÔNG dùng DELIMITER; câu cuối của tệp kết thúc bằng "END;".
-- Đầu vào: p_order_id (mã đơn), p_code (mã giảm giá khách nhập).
-- Đầu ra: p_discount (số tiền được giảm) khi thành công; lỗi nghiệp vụ trả bằng SIGNAL theo bảng ở Phần C của đề bài.
DROP PROCEDURE IF EXISTS sp_apply_coupon;

CREATE PROCEDURE sp_apply_coupon(IN p_order_id INT UNSIGNED, IN p_code VARCHAR(20),
    OUT p_discount INT UNSIGNED)
BEGIN
END;
