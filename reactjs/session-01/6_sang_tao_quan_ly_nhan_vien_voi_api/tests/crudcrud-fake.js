// Bản giả của crudcrud.com dùng trong test: cùng quy tắc với dịch vụ thật mà sinh viên gọi từ trình duyệt.
// Dữ liệu nằm trong bộ nhớ, ghi (POST, PUT, DELETE) đổi dữ liệu thật như crudcrud: lấy lại danh sách sẽ thấy thay đổi.
//
// Hành vi đã đối chiếu từng yêu cầu với crudcrud thật bằng `_shared/contract/doi_chieu_crudcrud.mjs`:
//   GET /<tài nguyên>           200, MẢNG mọi bản ghi. KHÔNG lọc, KHÔNG phân trang, KHÔNG sắp xếp: mọi tham số truy vấn
//                               (`?name=A`, `_limit`, `q`, `_page`...) đều bị bỏ qua. Lọc, tìm kiếm, phân trang làm ở trình duyệt.
//   GET /<tài nguyên>/<_id>     200 và bản ghi; không có thì 404; `_id` sai định dạng thì 404 không thân
//   POST /<tài nguyên>          201 và bản ghi kèm `_id` (chuỗi 24 ký tự hex); thân có `_id` hoặc là mảng thì 500
//   PUT /<tài nguyên>/<_id>     thay CẢ bản ghi (trường không gửi sẽ MẤT), 200 không thân; thân có `_id` thì 500; không có thì 404
//   PATCH                       không hỗ trợ: 404 không thân
//   DELETE /<tài nguyên>/<_id>  200 không thân; không có thì 404
//   Quá 100 yêu cầu cho một endpoint: 400 `Endpoint has exceeded allowed number of requests (100).`
//   (dịch vụ thật không kèm header CORS ở lỗi này nên trình duyệt chỉ thấy "Network Error")
//
// Dùng trong test:
//   import seed from "../db.seed.json";
//   import { installCrudcrud } from "./crudcrud-fake.js";
//   const server = installCrudcrud(seed);            // gọi BÊN TRONG test hoặc beforeEach
//   server.db.employees                               // dữ liệu hiện tại trong "máy chủ" (mỗi bản ghi có `_id`)
//   server.requestCount()                             // số yêu cầu đã gửi tới endpoint
//   window.mockApi.callsTo("POST /employees")         // nhật ký yêu cầu (của mock-api.js)

export const QUOTA = 100;
export const DEFAULT_ENDPOINT = "https://crudcrud.com/api/0123456789abcdef0123456789abcdef";

const ENDPOINT_PATTERN = /^https:\/\/crudcrud\.com\/api\/[a-f0-9]{32}/;
const OBJECT_ID = /^[a-f0-9]{24}$/;
const clone = (value) => JSON.parse(JSON.stringify(value));

const PROBLEM_404 = () => ({
  status: 404,
  body: { type: "https://tools.ietf.org/html/rfc7231#section-6.5.4", title: "Not Found", status: 404, traceId: "0HNPRQ4BFF91E:00000001" },
  headers: { "content-type": "application/problem+json; charset=utf-8" },
});
const EMPTY = (status) => ({ status, body: null, headers: {} });

/** Lõi thuần của máy chủ giả: nhận một yêu cầu, trả `{ status, body, headers }`. Không phụ thuộc trình duyệt. */
export function createCrudcrudCore(seed = {}) {
  const db = {};
  let counter = 0;
  const makeId = () => "6aed" + (++counter).toString(16).padStart(20, "0");
  Object.keys(seed).forEach((name) => {
    db[name] = clone(seed[name]).map((row) => ({ ...row, _id: makeId() }));
  });

  function handle({ method, path, query = {}, body }) {
    const parts = path.replace(/^\/api\/[a-f0-9]{32}/, "").split("/").filter(Boolean);
    const [name, id] = parts;
    if (!name || parts.length > 2) return PROBLEM_404();
    const rows = db[name] || (db[name] = []);

    if (id === undefined) {
      if (method === "GET") {
        return { status: 200, body: clone(rows), headers: {} };
      }
      if (method === "POST") {
        if (!body || typeof body !== "object" || Array.isArray(body) || "_id" in body) return EMPTY(500);
        const row = { ...clone(body), _id: makeId() };
        rows.push(row);
        return { status: 201, body: clone(row), headers: {} };
      }
      return PROBLEM_404();
    }

    if (!OBJECT_ID.test(id)) return EMPTY(404);
    const index = rows.findIndex((r) => r._id === id);
    if (method === "GET") return index < 0 ? PROBLEM_404() : { status: 200, body: clone(rows[index]), headers: {} };
    if (method === "DELETE") {
      if (index < 0) return PROBLEM_404();
      rows.splice(index, 1);
      return EMPTY(200);
    }
    if (method === "PUT") {
      if (!body || typeof body !== "object" || Array.isArray(body) || "_id" in body) return EMPTY(500);
      if (index < 0) return PROBLEM_404();
      rows[index] = { ...clone(body), _id: id };
      return EMPTY(200);
    }
    return EMPTY(404);
  }

  return { db, handle };
}

/**
 * Cài máy chủ giả vào `window.mockApi` của mock-api.js: mọi yêu cầu tới một endpoint crudcrud (hoặc `endpoint` nếu truyền)
 * do máy chủ giả trả lời. Gọi bên trong từng test (hoặc beforeEach): `setup.js` xóa mọi luật trước mỗi test.
 * Luật đặt SAU (ví dụ `window.mockApi.fail(...)`) có ưu tiên cao hơn nên dùng được để gây lỗi cho một tuyến.
 */
export function installCrudcrud(seed = {}, { endpoint, quota = QUOTA } = {}) {
  const core = createCrudcrudCore(seed);
  let count = 0;
  window.mockApi.respond(
    (req) => (endpoint ? req.url.startsWith(endpoint) : ENDPOINT_PATTERN.test(req.url)),
    (req) => {
      count++;
      if (count > quota) {
        return {
          status: 400,
          body: `Endpoint has exceeded allowed number of requests (${quota}).`,
          headers: { "content-type": "text/plain; charset=utf-8" },
        };
      }
      return core.handle({ method: req.method, path: req.path, query: req.query, body: req.body });
    }
  );
  return { db: core.db, endpoint: endpoint || DEFAULT_ENDPOINT, requestCount: () => count };
}
