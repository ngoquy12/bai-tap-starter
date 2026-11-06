// ===== BÀI LÀM: products.controller =====
// TODO: đọc request đã được validate, gọi repository, chọn mã trạng thái và định dạng phản hồi.
const repository = require("../repositories/products.repository");
const httpError = require("../errors/httpError");

async function listProducts(req, res) {
  throw new Error("TODO: listProducts chưa viết");
}

async function getProduct(req, res) {
  throw new Error("TODO: getProduct chưa viết");
}

async function createProduct(req, res) {
  throw new Error("TODO: createProduct chưa viết");
}

// Dùng chung cho PUT và PATCH: hai route khác nhau ở schema gắn trên route
async function updateProduct(req, res) {
  throw new Error("TODO: updateProduct chưa viết");
}

async function deleteProduct(req, res) {
  throw new Error("TODO: deleteProduct chưa viết");
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
