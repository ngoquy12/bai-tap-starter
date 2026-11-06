// ===== Mã nền (có sẵn, KHÔNG sửa) =====
// Đọc request đã được validate, gọi repository, chọn mã trạng thái và định dạng phản hồi
const repository = require("../repositories/products.repository");
const httpError = require("../errors/httpError");

async function listProducts(req, res) {
  const filters = req.query;
  const [data, total] = await Promise.all([repository.findAll(filters), repository.count(filters)]);
  res.json({
    data,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  });
}

async function getProduct(req, res) {
  const product = await repository.findById(req.params.id);
  if (!product) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy sản phẩm");
  }
  res.json(product);
}

async function createProduct(req, res) {
  const product = await repository.create(req.body);
  res.status(201).json(product);
}

// Dùng chung cho PUT (đủ trường) và PATCH (một phần): khác nhau ở schema gắn trên route
async function updateProduct(req, res) {
  const product = await repository.update(req.params.id, req.body);
  if (!product) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy sản phẩm");
  }
  res.json(product);
}

async function deleteProduct(req, res) {
  const removed = await repository.remove(req.params.id);
  if (!removed) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy sản phẩm");
  }
  res.status(204).end();
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
// ===== HẾT MÃ NỀN =====
