// ===== BÀI LÀM: stats.schema.js =====
const { z } = require("zod");

// Query của GET /stats: top (số nguyên 1-10, mặc định 3) với thông báo cố định trong đề.
const statsQuerySchema = z.object({});

module.exports = { statsQuerySchema };
