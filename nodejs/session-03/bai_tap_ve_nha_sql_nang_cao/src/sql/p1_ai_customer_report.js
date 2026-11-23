// P1 (Mức AI: AI-2): hai truy vấn báo cáo khách hàng do trợ lý AI sinh theo yêu cầu của chị Lan.
// Yêu cầu gửi cho AI: xem bảng Đầu ra của bài P1 trong de_bai.md.
// Bạn kiểm chứng bằng tests/p1.test.js, sửa ngay trong tệp này và ghi NHAT_KY_P1.md.

// Đầu vào: không có tham số.
// Đầu ra: userId, fullName, orderCount, itemsBought, totalSpent; mỗi người dùng một hàng.
const customerOverview = `
SELECT u.id AS userId, u.full_name AS fullName,
    COUNT(DISTINCT o.id) AS orderCount,
    COALESCE(SUM(oi.quantity), 0) AS itemsBought,
    COALESCE(SUM(o.total), 0) AS totalSpent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY u.id, u.full_name
ORDER BY totalSpent DESC, userId`;

// Đầu vào: [limit, offset].
// Đầu ra: userId, fullName, totalSpent, spendRank; một trang của bảng xếp hạng chi tiêu.
const topCustomersPage = `
WITH spending AS (
    SELECT u.id, u.full_name, COALESCE(SUM(o.total), 0) AS total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.full_name
)
SELECT id AS userId, full_name AS fullName, total_spent AS totalSpent,
    ROW_NUMBER() OVER (ORDER BY total_spent DESC) AS spendRank
FROM spending
ORDER BY total_spent DESC
LIMIT ? OFFSET ?`;

module.exports = { customerOverview, topCustomersPage };
