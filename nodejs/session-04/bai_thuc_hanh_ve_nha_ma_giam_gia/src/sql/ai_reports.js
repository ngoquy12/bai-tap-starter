// Phần D (Mức AI: AI-2): mã do trợ lý AI sinh cho trang báo cáo mã giảm giá.
// Anh Hùng nhờ trợ lý AI viết ba truy vấn dưới đây theo yêu cầu ở mục 4, Phần D của đề bài.
// Mã chạy được và trả kết quả trông hợp lý. Việc của bạn: kiểm chứng bằng test, sửa chỗ sai,
// giữ chỗ đúng, rồi ghi mọi quyết định vào NHAT_KY_AI.md (Giữ / Sửa / Loại bỏ, lý do, bằng chứng).
// Giữ nguyên tên xuất, tên cột và thứ tự tham số.

// Mỗi mã: số danh mục được áp, số lượt đã dùng và tổng tiền đã giảm. Không tham số.
const couponCategorySummary = `
SELECT c.code,
    COUNT(DISTINCT cc.category_id) AS categoryCount,
    COUNT(DISTINCT r.id) AS usedCount,
    COALESCE(SUM(r.discount_amount), 0) AS totalDiscount
FROM coupons c
LEFT JOIN coupon_categories cc ON cc.coupon_id = c.id
LEFT JOIN coupon_redemptions r ON r.coupon_id = c.id
GROUP BY c.id, c.code
ORDER BY c.code`;

// Khách hàng đã có đơn nhưng chưa đơn nào áp mã giảm giá. Không tham số.
const customersWithoutCoupon = `
SELECT u.id, u.full_name AS fullName
FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
    AND u.id NOT IN (
        SELECT o.user_id
        FROM coupon_redemptions r
        JOIN orders o ON o.id = r.order_id
    )
ORDER BY u.id`;

// Lịch sử áp mã, mới nhất trước, phân trang. Tham số: [limit, offset].
const redemptionHistoryPage = `
SELECT r.id AS redemptionId, c.code, r.order_id AS orderId,
    r.discount_amount AS discountAmount
FROM coupon_redemptions r
JOIN coupons c ON c.id = r.coupon_id
ORDER BY r.redeemed_at DESC
LIMIT ? OFFSET ?`;

module.exports = {
  couponCategorySummary,
  customersWithoutCoupon,
  redemptionHistoryPage,
};
