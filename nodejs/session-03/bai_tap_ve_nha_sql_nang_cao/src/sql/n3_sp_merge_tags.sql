-- N3 (Mức AI: AI-0): procedure gộp hai nhãn sản phẩm.
-- Tệp gửi một lần bằng mysql2 nên KHÔNG dùng DELIMITER; câu cuối của tệp kết thúc bằng "END;".
-- Đầu vào: p_from_tag_id (nhãn bị gộp và bị xóa), p_to_tag_id (nhãn giữ lại).
-- Đầu ra: p_moved (số sản phẩm vừa được gắn thêm nhãn giữ lại).
-- Lỗi nghiệp vụ trả bằng SIGNAL theo bảng quy tắc của bài N3.
DROP PROCEDURE IF EXISTS sp_merge_tags;

CREATE PROCEDURE sp_merge_tags(IN p_from_tag_id INT UNSIGNED, IN p_to_tag_id INT UNSIGNED,
    OUT p_moved INT)
BEGIN
END;
