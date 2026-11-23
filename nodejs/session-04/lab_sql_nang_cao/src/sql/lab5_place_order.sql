-- Lab 5: procedure đặt hàng sp_place_order. Mã dưới đây do trợ lý AI sinh theo yêu cầu ở Lab 5 của lab_guide.md.
-- Nhiệm vụ của bạn: chạy test, tìm chỗ sai so với quy tắc nghiệp vụ, sửa ngay trong tệp này và ghi docs/nhat_ky_ai.md.
DROP PROCEDURE IF EXISTS sp_place_order;

CREATE PROCEDURE sp_place_order(IN p_user_id INT UNSIGNED, IN p_product_id INT UNSIGNED,
    IN p_quantity INT UNSIGNED, OUT p_order_id INT UNSIGNED)
BEGIN
    DECLARE v_price INT UNSIGNED;
    DECLARE v_stock INT UNSIGNED;
    START TRANSACTION;
    SELECT price, stock INTO v_price, v_stock FROM products WHERE id = p_product_id;
    INSERT INTO orders (user_id, total) VALUES (p_user_id, v_price * p_quantity);
    SET p_order_id = LAST_INSERT_ID();
    INSERT INTO order_items (order_id, product_id, quantity, unit_price)
    VALUES (p_order_id, p_product_id, p_quantity, v_price);
    IF v_stock < p_quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không đủ hàng trong kho';
    END IF;
    UPDATE products SET stock = v_stock - p_quantity WHERE id = p_product_id;
    COMMIT;
END;
