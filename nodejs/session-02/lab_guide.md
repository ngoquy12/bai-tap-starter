# Session 02 - Thực hành: API Rikkei Learn với Express và MySQL

**Thời lượng:** ~150 phút (6 lab nối tiếp + 5 phút tổng kết) | **Hình thức:** làm cá nhân trên máy của mình
**Điều kiện tiên quyết:** đã hoàn thành Session 01 (Lesson 01 - Lesson 07) và các môn JavaScript cơ bản, JavaScript nâng cao (`Promise`, `async`/`await`, `fetch`, `axios`)
**Công cụ:** Visual Studio Code, Node.js 18 trở lên (kiểm tra bằng `node --version`), MySQL 8 đang chạy (dòng lệnh `mysql` hoặc MySQL Workbench), `curl` (trên Windows dùng Git Bash, hoặc `curl.exe` trong PowerShell), Postman hoặc Thunder Client
**Nguyên tắc bắt buộc:** lab chỉ dùng những gì đã học ở Session 01: Express 4, `express.Router()`, middleware, `mysql2/promise`, truy vấn tham số hóa `?`, giao dịch, `zod`, `bcryptjs`, `jsonwebtoken`, `cors`, `helmet`, `morgan`, `express-rate-limit`, Vitest và Supertest. Lab KHÔNG dùng `class`, `this`, ORM, TypeScript, ES module, refresh token hay upload tệp. Nếu thấy cần một kỹ thuật ngoài danh sách này, hãy ghi vào mục "Tự học thêm" cuối tài liệu.

**Kịch bản xuyên suốt:** Chị Lan (Product Owner) giao cho bạn, thực tập sinh lập trình, dựng "Rikkei Learn API" cho hệ thống học trực tuyến: khóa học, bài học, học viên, ghi danh. Anh Hùng (Tech Lead) chốt cách làm: một dự án Express dùng MySQL, đi từ API trong bộ nhớ (Lab 1), truy vấn SQL (Lab 2), repository `mysql2` (Lab 3), API `/courses` đầy đủ (Lab 4), đăng nhập và phân quyền (Lab 5), rồi thống kê và lớp bảo vệ (Lab 6).

**Một dự án chung:** 6 bài tập của Session 02 là 6 PHẦN của cùng một API, và 6 lab này là 6 phần tương ứng. Lab dựng bản rút gọn của từng phần trong một thư mục `rikkei-learn`, dùng đúng tên tệp, hàm và thông báo của bài tập (`httpError`, `errorHandler`, `enrollStudent`, `validate`, `authenticate`, `authorize`, `loginLimiter`...). Mã bạn viết ở lab là nền để làm bài tập tương ứng; mỗi bài tập là một chức năng thực tế của cùng API, nhận dự án nền và bộ test tự chấm, và mở rộng phần tương ứng của lab (phân trang `{ data, meta }`, lọc `q`, sắp xếp, `PATCH`, `byStatus`, thống kê, test tự viết...). Hãy làm đúng thứ tự vì lab sau dùng lại tệp của lab trước.

| Lab | Nội dung | Bài tập tương ứng |
| :-: | :-- | :-- |
| 1 | Dựng dự án, API khóa học trong bộ nhớ: thứ tự route, `express.json()`, lỗi chuẩn | Bài 1: API khóa học và bài học trong bộ nhớ |
| 2 | Cơ sở dữ liệu `rikkei_learn`, `JOIN`, `LEFT JOIN`, `GROUP BY`, `src/sql/queries.js` | Bài 2: thống kê học tập và bảng chứng chỉ bằng SQL |
| 3 | `mysql2`, repository, SQL injection, giao dịch `enrollStudent` | Bài 3: ghi danh và tiến độ học bằng mysql2 |
| 4 | `zod`, `validate`, phân trang, lọc, `errorHandler` cho lỗi MySQL, `DELETE` cascade | Bài 4: API khóa học đầy đủ |
| 5 | `bcryptjs`, JWT, `authenticate`, `authorize`, ghi danh, quyền sở hữu | Bài 5: đăng nhập, phân quyền và ghi danh |
| 6 | `/stats`, `helmet`, CORS, giới hạn đăng nhập, `morgan`, Vitest | Bài 6: thống kê, lớp bảo vệ và test của riêng bạn |

**Cách tổ chức mã (đọc kỹ trước khi bắt đầu):**

1. Sao chép thư mục `_shared/node-template` của môn học thành thư mục `rikkei-learn`. Khuôn đã ghim sẵn phiên bản các gói (Express 4.21.2, mysql2 3.11.5, zod 3.24.1, bcryptjs 2.4.3, jsonwebtoken 9.0.2, cors, helmet, morgan, express-rate-limit, Vitest, Supertest), nên KHÔNG chạy `npm init` hay cài gói tự do. Tạo thư mục `db` trong `rikkei-learn` rồi chép `schema.sql` và `seed.sql` từ `_shared/db-learn` vào đó.
2. Mỗi bước dưới đây ghi rõ tệp nào cần tạo hoặc ghi đè; sao chép đúng mã trong khối rồi lưu. Khi bạn lưu tệp, `nodemon` tự khởi động lại máy chủ.
3. Lệnh `curl` trong tài liệu viết cho Git Bash, macOS và Linux. Mỗi lệnh có cách làm tương đương trong Postman hoặc Thunder Client theo bảng sau; kết quả (mã trạng thái, thân JSON) giống hệt.

| Thành phần của lệnh `curl` | Trong Postman hoặc Thunder Client |
| :-- | :-- |
| `-X POST` và địa chỉ | chọn method `POST` và dán địa chỉ vào ô URL |
| `-H "Content-Type: application/json"` | thẻ Headers; hoặc chọn Body kiểu JSON (công cụ tự thêm header) |
| `-d '{...}'` | thẻ Body, kiểu raw JSON, dán nội dung |
| `-H "Authorization: Bearer $TOKEN"` | thẻ Auth, kiểu Bearer Token, dán token; hoặc thêm header `Authorization` |
| `-w "\nHTTP %{http_code}\n"` | mã trạng thái nằm ở thanh kết quả (Status) |
| `-s` | không có (công cụ không in thanh tiến trình) |

4. Trên Windows, nếu chữ có dấu trong `-d '...'` bị biến thành dấu `?` ở Git Bash, hãy lưu body vào một tệp UTF-8 rồi dùng `--data-binary @tep.json`, hoặc dùng Postman, Thunder Client. Chữ có dấu trong kết quả của lệnh `mysql` cần terminal dùng UTF-8 (thêm `--default-character-set=utf8mb4` nếu thấy chữ lỗi).
5. Phần "Kết quả mong đợi" của mỗi bước là đầu ra thật của đúng lệnh trong bước đó: dòng log của máy chủ, thân JSON, mã trạng thái, hàng trong bảng MySQL. Ba chỗ có thể khác trên máy bạn: các mốc thời gian (`Date`, thời gian xử lý của `morgan`, `Duration` của Vitest), giá trị `ETag`, và nhiều dòng `[nodemon] restarting due to changes...` liên tiếp được rút thành một dòng trong tài liệu (lưu nhiều tệp cùng lúc thì nodemon in nhiều dòng). Tên cơ sở dữ liệu trong tài liệu là `rikkei_learn` và `rikkei_learn_test`; cổng máy chủ là 3000.
6. Các bước ghi "cố tình sai" yêu cầu bạn tạo một lỗi để thấy thông báo thật. Hãy làm theo, quan sát, rồi sửa đúng như hướng dẫn trước khi sang bước sau.

**Quy ước mã (Anh Hùng yêu cầu):** CommonJS (`require`, `module.exports`); hàm có tên khai báo bằng `function`, callback ngắn dùng arrow function; `async/await`; chuỗi dùng ngoặc kép; thụt lề 2 dấu cách; SQL viết hoa từ khóa và luôn tham số hóa bằng `?`; tên biến, hàm, tệp bằng tiếng Anh; chú thích và thông báo cho người dùng bằng tiếng Việt có dấu; không `class`, không `this`, không `var`.

**Dữ liệu mẫu và tài khoản (từ `db/seed.sql`):**

| Nội dung | Điều cần nhớ |
| :-- | :-- |
| Khóa học | 6 khóa, `id` 1 đến 6: HTML và CSS cơ bản, JavaScript cơ bản, JavaScript nâng cao, ReactJS, NodeJS và Express, Cơ sở dữ liệu MySQL |
| Bài học, ghi danh | 15 bài học; 10 ghi danh (ghi danh số 7 của học viên 4 ở khóa 4 là `dropped`) |
| Tài khoản (mật khẩu mọi tài khoản: `Matkhau123`) | `admin@rikkei.edu` (admin, `id` 1); `an@`, `binh@`, `chi@`, `dung@`, `giang@rikkei.edu` (student, `id` 2 đến 6) |
| Thời gian | `enrolledAt` và `createdAt` phụ thuộc múi giờ máy chủ, nên lab không in chúng |

**Ba lỗi thường gặp khi chạy lab (xử lý ngay nếu gặp):**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| `Không nạp được cơ sở dữ liệu: Access denied for user 'root'@'localhost' (using password: YES)` (mã `ER_ACCESS_DENIED_ERROR`) | `DB_USER` hoặc `DB_PASSWORD` trong `.env` không đúng với MySQL của bạn | Sửa `.env` cho khớp tài khoản MySQL (thường `DB_PORT=3306`, `DB_USER=root`); lưu rồi chạy lại |
| `Error: listen EADDRINUSE: address already in use :::3000` | Cổng 3000 đang được một máy chủ khác (hoặc một cửa sổ `npm run dev` cũ) dùng | Tắt cửa sổ cũ (Ctrl+C), hoặc đổi `PORT` trong `.env` |
| `Unknown database 'rikkei_learn'` hoặc `Table '...courses' doesn't exist` | chưa chạy `npm run db:setup`, hoặc `DB_NAME` trong `.env` trỏ sai | Chạy `npm run db:setup`; kiểm tra `DB_NAME=rikkei_learn` |

Tình huống thật của ba lỗi trên được ghi lại ở cuối Lab 3 (hai lỗi cơ sở dữ liệu) và ở phần Lỗi hay gặp của Lab 1 (cổng bận).

---

## Lab 1 - Dựng dự án và API khóa học trong bộ nhớ (20 phút)

**Áp dụng:** Lesson 01, Lesson 02

**Mục tiêu:** dựng dự án từ khuôn, chạy `npm run dev`, viết `src/app.js` (chỉ xuất app) và `src/server.js` (mới mở cổng), gắn `httpError`, `errorHandler`, `notFound`; làm `GET /courses`, `GET /courses/search`, `GET /courses/:id`, `POST /courses`; tự gây hai lỗi kinh điển (thứ tự route và quên `express.json()`) để đọc đúng kết quả.

**Các bước thực hiện:**

**Bước 1. Dựng dự án.** Làm theo mục "Cách tổ chức mã". Trong thư mục `rikkei-learn`, mở terminal của VS Code, chạy `npm install`, rồi tạo `.env` từ `.env.example`:

```bash
npm install
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
```

Mở `.env` và sửa các dòng sau cho khớp MySQL của bạn (các dòng còn lại giữ nguyên):

```text
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat-khau-mysql-cua-ban
DB_NAME=rikkei_learn
DB_NAME_TEST=rikkei_learn_test
```

Lab 1 chưa dùng MySQL, nhưng đặt đúng `.env` ngay từ đầu để các lab sau không phải quay lại. Không commit `.env`.

**Bước 2. Nền tảng của ứng dụng.** Tạo các tệp sau (`httpError` tạo lỗi có mã; `errorHandler` là nơi duy nhất biến lỗi thành JSON chuẩn; `notFound` xử lý đường dẫn lạ; `asyncHandler` dành cho các lab sau).

Tệp `src/errors/httpError.js`:

```javascript
// Hàm tạo lỗi có mã trạng thái HTTP, mã lỗi và chi tiết (tùy chọn).
function httpError(status, code, message, details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details) error.details = details;
  return error;
}

module.exports = httpError;
```

Tệp `src/middlewares/errorHandler.js`:

```javascript
// Middleware lỗi (đúng 4 tham số): nơi duy nhất biến lỗi thành phản hồi JSON chuẩn.
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "JSON không hợp lệ" } });
  }
  if (err.status && err.code) {
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json({ error: body });
  }
  console.error(err); // chỉ ghi nhật ký, không trả chi tiết cho client
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ" } });
}

module.exports = errorHandler;
```

Tệp `src/middlewares/notFound.js`:

```javascript
const httpError = require("../errors/httpError");

// Đường dẫn không khớp route nào: chuyển cho errorHandler tạo phản hồi chuẩn.
function notFound(req, res, next) {
  next(httpError(404, "NOT_FOUND", "Không tìm thấy đường dẫn"));
}

module.exports = notFound;
```

Tệp `src/middlewares/asyncHandler.js`:

```javascript
// Bọc handler async: lỗi của promise được chuyển sang next để tới errorHandler.
function asyncHandler(handler) {
  return function (req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
```

Tệp `src/app.js` (chỉ xuất `app`, không `listen`):

```javascript
const express = require("express");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Tệp `src/server.js` (chỉ tệp này mở cổng):

```javascript
// Điểm khởi động của máy chủ: chỉ tệp này gọi listen, app.js chỉ xuất app.
const app = require("./app");
const config = require("./config/env");

app.listen(config.port, () => {
  console.log(`Máy chủ chạy ở http://localhost:${config.port}`);
});
```

Chạy máy chủ:

```bash
npm run dev
```

Kết quả mong đợi trong terminal (`nodemon` giữ cửa sổ này, đừng đóng):

```text

> rikkei-node-exercise@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Mở cửa sổ terminal thứ hai cho các lệnh `curl`. Thử đường dẫn có thật và đường dẫn không có thật:

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/health
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/khong-co
```

Kết quả mong đợi:

```text
{"status":"ok"}
HTTP 200
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy đường dẫn"}}
HTTP 404
```

Đường dẫn lạ trả JSON đúng định dạng lỗi chung `{ error: { code, message } }`, không phải trang HTML của Express.

**Bước 3. Danh sách, tìm kiếm và thứ tự route (cố tình sai).** Tạo `src/data/courses.js` (kho khóa học tạm), `src/routes/courses.routes.js` và ghi đè `src/app.js` để gắn router. Bản router dưới đây CỐ TÌNH đặt `/:id` trước `/search`.

Tệp `src/data/courses.js`:

```javascript
// Kho khóa học tạm trong bộ nhớ, cùng nội dung với bảng courses của Rikkei Learn.
const courses = [
  { id: 1, title: "HTML và CSS cơ bản", description: "Dựng trang web tĩnh từ đầu.", level: "beginner" },
  { id: 2, title: "JavaScript cơ bản", description: "Biến, hàm, mảng, đối tượng.", level: "beginner" },
  { id: 3, title: "JavaScript nâng cao", description: "Bất đồng bộ và gọi API.", level: "intermediate" },
  { id: 4, title: "ReactJS", description: "Xây giao diện bằng component.", level: "intermediate" },
  { id: 5, title: "NodeJS và Express", description: "Viết API với Express và MySQL.", level: "intermediate" },
  { id: 6, title: "Cơ sở dữ liệu MySQL", description: "Thiết kế bảng và truy vấn SQL.", level: "beginner" },
];

module.exports = courses;
```

Tệp `src/routes/courses.routes.js` (bản có lỗi thứ tự):

```javascript
const express = require("express");
const courses = require("../data/courses");
const httpError = require("../errors/httpError");

const router = express.Router();

// Danh sách khóa học, lọc theo ?level= khi có.
router.get("/", (req, res) => {
  const { level } = req.query;
  res.json(level ? courses.filter((course) => course.level === level) : courses);
});

// Xem chi tiết một khóa học theo id (req.params.id là chuỗi nên đổi sang số).
router.get("/:id", (req, res) => {
  const course = courses.find((item) => item.id === Number(req.params.id));
  if (!course) throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  res.json(course);
});

// Tìm khóa học theo tiêu đề.
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  res.json(courses.filter((course) => course.title.toLowerCase().includes(q)));
});

module.exports = router;
```

Tệp `src/app.js` (thêm một dòng `require` và một dòng `app.use("/courses", ...)`):

```javascript
const express = require("express");
const coursesRouter = require("./routes/courses.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/courses", coursesRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Khi bạn lưu, terminal chạy `npm run dev` in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Thử danh sách có lọc và tìm kiếm:

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses?level=beginner"
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses/search?q=java"
```

Kết quả mong đợi:

```text
[{"id":1,"title":"HTML và CSS cơ bản","description":"Dựng trang web tĩnh từ đầu.","level":"beginner"},{"id":2,"title":"JavaScript cơ bản","description":"Biến, hàm, mảng, đối tượng.","level":"beginner"},{"id":6,"title":"Cơ sở dữ liệu MySQL","description":"Thiết kế bảng và truy vấn SQL.","level":"beginner"}]
HTTP 200
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy khóa học"}}
HTTP 404
```

Tìm `java` báo "Không tìm thấy khóa học" vì Express thử route theo thứ tự khai báo: `/courses/search` khớp `/:id` với `id` là chữ `search`, `Number("search")` là `NaN` nên không có khóa nào. Sửa: đặt `/search` TRƯỚC `/:id`. Ghi đè `src/routes/courses.routes.js`:

```javascript
const express = require("express");
const courses = require("../data/courses");
const httpError = require("../errors/httpError");

const router = express.Router();

// Danh sách khóa học, lọc theo ?level= khi có.
router.get("/", (req, res) => {
  const { level } = req.query;
  res.json(level ? courses.filter((course) => course.level === level) : courses);
});

// Route cố định /search phải đứng trước /:id, nếu không "search" bị hiểu là một id.
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  res.json(courses.filter((course) => course.title.toLowerCase().includes(q)));
});

// Xem chi tiết một khóa học theo id (req.params.id là chuỗi nên đổi sang số).
router.get("/:id", (req, res) => {
  const course = courses.find((item) => item.id === Number(req.params.id));
  if (!course) throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  res.json(course);
});

module.exports = router;
```

Sau khi lưu, thử lại:

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses/search?q=java"
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/5
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/99
```

Kết quả mong đợi:

```text
[{"id":2,"title":"JavaScript cơ bản","description":"Biến, hàm, mảng, đối tượng.","level":"beginner"},{"id":3,"title":"JavaScript nâng cao","description":"Bất đồng bộ và gọi API.","level":"intermediate"}]
HTTP 200
{"id":5,"title":"NodeJS và Express","description":"Viết API với Express và MySQL.","level":"intermediate"}
HTTP 200
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy khóa học"}}
HTTP 404
```

**Bước 4. Tạo khóa học và quên `express.json()` (cố tình sai).** Ghi đè `src/routes/courses.routes.js` bằng bản có thêm `POST /` (giữ nguyên `src/app.js` của Bước 3, chưa có `express.json()`):

```javascript
const express = require("express");
const courses = require("../data/courses");
const httpError = require("../errors/httpError");

const router = express.Router();
const LEVELS = ["beginner", "intermediate", "advanced"];

// Danh sách khóa học, lọc theo ?level= khi có.
router.get("/", (req, res) => {
  const { level } = req.query;
  res.json(level ? courses.filter((course) => course.level === level) : courses);
});

// Route cố định /search phải đứng trước /:id, nếu không "search" bị hiểu là một id.
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  res.json(courses.filter((course) => course.title.toLowerCase().includes(q)));
});

// Xem chi tiết một khóa học theo id (req.params.id là chuỗi nên đổi sang số).
router.get("/:id", (req, res) => {
  const course = courses.find((item) => item.id === Number(req.params.id));
  if (!course) throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  res.json(course);
});

// Tạo khóa học mới: kiểm tra dữ liệu, rồi trả 201 kèm khóa học vừa tạo.
router.post("/", (req, res) => {
  const { title, description = "", level } = req.body;
  const details = [];
  if (typeof title !== "string" || title.trim() === "") {
    details.push({ field: "title", message: "Tiêu đề không được để trống" });
  }
  if (!LEVELS.includes(level)) {
    details.push({ field: "level", message: "Cấp độ phải là beginner, intermediate hoặc advanced" });
  }
  if (details.length > 0) {
    throw httpError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", details);
  }
  const id = courses.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const course = { id, title: title.trim(), description, level };
  courses.push(course);
  res.status(201).json(course);
});

module.exports = router;
```

Gửi yêu cầu tạo khóa học:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"title":"Docker cơ bản","level":"beginner"}'
```

Kết quả mong đợi:

```text
{"error":{"code":"INTERNAL_ERROR","message":"Lỗi máy chủ"}}
HTTP 500
```

Client chỉ thấy "Lỗi máy chủ" (đúng, không lộ chi tiết nội bộ). Nguyên nhân nằm ở terminal của `npm run dev`, dòng đầu của lỗi được `errorHandler` ghi nhật ký:

```text
TypeError: Cannot destructure property 'title' of 'req.body' as it is undefined.
```

Express không đọc body JSON nếu chưa có `express.json()`, nên `req.body` là `undefined`. Sửa: ghi đè `src/app.js`, thêm `app.use(express.json());` TRƯỚC router:

```javascript
const express = require("express");
const coursesRouter = require("./routes/courses.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/courses", coursesRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Sau khi lưu (terminal in `[nodemon] restarting due to changes...` rồi `starting`, rồi dòng chạy máy chủ), thử ba yêu cầu: hợp lệ, sai dữ liệu, JSON sai cú pháp:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"title":"Docker cơ bản","level":"beginner"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"title":"  ","level":"expert"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"title":'
```

Kết quả mong đợi:

```text
{"id":7,"title":"Docker cơ bản","description":"","level":"beginner"}
HTTP 201
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"title","message":"Tiêu đề không được để trống"},{"field":"level","message":"Cấp độ phải là beginner, intermediate hoặc advanced"}]}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"JSON không hợp lệ"}}
HTTP 400
```

Đầu ra nodemon sau khi lưu `src/app.js`:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Cuối cùng xem lại danh sách cấp độ `beginner`, khóa vừa tạo đã nằm trong kho tạm (mất khi máy chủ khởi động lại vì chỉ ở bộ nhớ):

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses?level=beginner"
```

```text
[{"id":1,"title":"HTML và CSS cơ bản","description":"Dựng trang web tĩnh từ đầu.","level":"beginner"},{"id":2,"title":"JavaScript cơ bản","description":"Biến, hàm, mảng, đối tượng.","level":"beginner"},{"id":6,"title":"Cơ sở dữ liệu MySQL","description":"Thiết kế bảng và truy vấn SQL.","level":"beginner"},{"id":7,"title":"Docker cơ bản","description":"","level":"beginner"}]
HTTP 200
```

**Điểm kiểm tra Lab 1:**
- [ ] `npm run dev` in `Máy chủ chạy ở http://localhost:3000`; `GET /health` trả `{"status":"ok"}` mã 200.
- [ ] Đường dẫn lạ trả 404 JSON `Không tìm thấy đường dẫn`.
- [ ] `GET /courses/search?q=java` trả hai khóa JavaScript (id 2 và 3) sau khi đưa `/search` lên trước `/:id`.
- [ ] `POST /courses` hợp lệ trả 201 và `id` 7; sai dữ liệu trả 400 với `details` hai mục; JSON sai cú pháp trả 400 `JSON không hợp lệ`.
- [ ] Giải thích được vì sao quên `express.json()` gây "Lỗi máy chủ" và vì sao client không thấy nguyên văn `TypeError`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| `Error: listen EADDRINUSE: address already in use :::3000` khi chạy `npm run dev` | cổng 3000 đã có tiến trình khác (thường là cửa sổ `npm run dev` cũ) | Ctrl+C cửa sổ cũ, hoặc đổi `PORT` trong `.env` |
| `Cannot find module './app'` | tạo `src/app.js` sai thư mục | đặt `app.js` và `server.js` cùng nằm trong `src/` |
| Sửa tệp nhưng kết quả cũ | `nodemon` chưa khởi động lại hoặc đã báo `app crashed` | đọc lỗi trong terminal, sửa, lưu lại |
| Chữ tiếng Việt trong `-d` thành `?` (Windows) | Git Bash đổi bảng mã khi gọi `curl.exe` | dùng `--data-binary @tep.json` hoặc Thunder Client |

Khi `npm run dev` chạy mà bạn thử mở thêm một máy chủ ở cùng cổng, kết quả thật là:

```text
node:events:496
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
```

(Các dòng sau đó là vết ngăn xếp của Node; dòng quan trọng là `EADDRINUSE`.)

---

## Lab 2 - Cơ sở dữ liệu `rikkei_learn` và truy vấn SQL (25 phút)

**Áp dụng:** Lesson 03

**Mục tiêu:** nạp lược đồ và dữ liệu bằng `npm run db:setup`, đọc bảng bằng dòng lệnh `mysql` (hoặc MySQL Workbench), viết `JOIN` ba bảng, phân biệt `LEFT JOIN` với điều kiện trong `ON` và trong `WHERE`, rồi đưa các truy vấn vào `src/sql/queries.js` và chạy chúng bằng Node.

**Các bước thực hiện:**

**Bước 1. Nạp cơ sở dữ liệu.** Máy chủ của Lab 1 có thể vẫn chạy. Mở terminal thứ hai và chạy:

```bash
npm run db:setup
```

Kết quả mong đợi:

```text

> rikkei-node-exercise@1.0.0 db:setup
> node scripts/db-setup.js

Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_learn.
```

Lệnh tạo cơ sở dữ liệu `rikkei_learn` (nếu chưa có) rồi chạy `db/schema.sql` và `db/seed.sql`. Chạy lại lệnh này bất cứ lúc nào để đưa dữ liệu về trạng thái ban đầu.

**Bước 2. Xem bảng.** Dùng dòng lệnh `mysql` (hoặc mở `rikkei_learn` trong MySQL Workbench và chạy cùng câu lệnh ở thẻ Query). Tùy chọn `-t` in dạng bảng; `-p` hỏi mật khẩu:

```bash
mysql -u root -p rikkei_learn -t -e "SHOW TABLES"
mysql -u root -p rikkei_learn -t -e "SELECT id, title, level FROM courses"
```

Kết quả mong đợi:

```text
+------------------------------+
| Tables_in_rikkei_learn |
+------------------------------+
| courses                      |
| enrollments                  |
| lessons                      |
| users                        |
+------------------------------+
+----+----------------------------+--------------+
| id | title                      | level        |
+----+----------------------------+--------------+
|  1 | HTML và CSS cơ bản         | beginner     |
|  2 | JavaScript cơ bản          | beginner     |
|  3 | JavaScript nâng cao        | intermediate |
|  4 | ReactJS                    | intermediate |
|  5 | NodeJS và Express          | intermediate |
|  6 | Cơ sở dữ liệu MySQL        | beginner     |
+----+----------------------------+--------------+
```

**Bước 3. `LEFT JOIN`: điều kiện ở `ON` hay `WHERE`.** Đếm số học viên đang học (`active`) của từng khóa. Câu thứ nhất đặt điều kiện trong `ON`, câu thứ hai trong `WHERE`:

```bash
mysql -u root -p rikkei_learn -t -e "SELECT c.id, c.title, COUNT(e.id) AS activeCount FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active' GROUP BY c.id, c.title ORDER BY c.id"
mysql -u root -p rikkei_learn -t -e "SELECT c.id, c.title, COUNT(e.id) AS activeCount FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id WHERE e.status = 'active' GROUP BY c.id, c.title ORDER BY c.id"
```

Kết quả mong đợi (6 hàng so với 5 hàng):

```text
+----+----------------------------+-------------+
| id | title                      | activeCount |
+----+----------------------------+-------------+
|  1 | HTML và CSS cơ bản         |           0 |
|  2 | JavaScript cơ bản          |           1 |
|  3 | JavaScript nâng cao        |           1 |
|  4 | ReactJS                    |           1 |
|  5 | NodeJS và Express          |           1 |
|  6 | Cơ sở dữ liệu MySQL        |           1 |
+----+----------------------------+-------------+
+----+----------------------------+-------------+
| id | title                      | activeCount |
+----+----------------------------+-------------+
|  2 | JavaScript cơ bản          |           1 |
|  3 | JavaScript nâng cao        |           1 |
|  4 | ReactJS                    |           1 |
|  5 | NodeJS và Express          |           1 |
|  6 | Cơ sở dữ liệu MySQL        |           1 |
+----+----------------------------+-------------+
```

Khóa 1 chỉ có ghi danh `completed`. Điều kiện trong `ON` quyết định hàng nào của `enrollments` được ghép, nên khóa 1 vẫn có mặt với số 0. Điều kiện trong `WHERE` lọc sau khi ghép, hàng `NULL` của khóa 1 bị loại. Mẫu `LEFT JOIN ... ON ... WHERE e.id IS NULL` tìm khóa không có học viên đang học:

```bash
mysql -u root -p rikkei_learn -t -e "SELECT c.id, c.title FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active' WHERE e.id IS NULL ORDER BY c.id"
```

```text
+----+------------------------+
| id | title                  |
+----+------------------------+
|  1 | HTML và CSS cơ bản     |
+----+------------------------+
```

**Bước 4. Đưa truy vấn vào mã.** Tạo `src/sql/queries.js` (bốn truy vấn) và `scripts/run-query.js` để chạy chúng:

Tệp `src/sql/queries.js`:

```javascript
// Các truy vấn mẫu cho Rikkei Learn (users, courses, lessons, enrollments).
// Mỗi truy vấn là một chuỗi SQL; tên cột sau AS chính là tên khóa JSON của API.

const queries = {
  // Chi tiết ghi danh: tên học viên, tên khóa học, trạng thái và tiến độ.
  enrollmentDetails:
    "SELECT e.id AS enrollmentId, u.full_name AS studentName, c.title AS courseTitle, e.status, e.progress " +
    "FROM enrollments e " +
    "JOIN users u ON u.id = e.user_id " +
    "JOIN courses c ON c.id = e.course_id " +
    "ORDER BY e.id",

  // Số lượt ghi danh của mỗi khóa học; khóa chưa ai ghi danh vẫn có mặt với số 0.
  studentsPerCourse:
    "SELECT c.id AS courseId, c.title, COUNT(e.id) AS studentCount " +
    "FROM courses c " +
    "LEFT JOIN enrollments e ON e.course_id = c.id " +
    "GROUP BY c.id, c.title " +
    "ORDER BY c.id",

  // Tiến độ trung bình (làm tròn 1 chữ số) của mỗi khóa, bỏ qua ghi danh đã hủy.
  averageProgressPerCourse:
    "SELECT c.id AS courseId, c.title, ROUND(AVG(e.progress), 1) AS avgProgress " +
    "FROM courses c " +
    "JOIN enrollments e ON e.course_id = c.id " +
    "WHERE e.status <> 'dropped' " +
    "GROUP BY c.id, c.title " +
    "ORDER BY c.id",

  // Khóa học có từ 2 học viên (đang học hoặc đã hoàn thành) trở lên.
  popularCourses:
    "SELECT c.id AS courseId, c.title, COUNT(*) AS studentCount " +
    "FROM courses c " +
    "JOIN enrollments e ON e.course_id = c.id " +
    "WHERE e.status IN ('active', 'completed') " +
    "GROUP BY c.id, c.title " +
    "HAVING COUNT(*) >= 2 " +
    "ORDER BY studentCount DESC, c.id",
};

module.exports = queries;
```

Tệp `scripts/run-query.js`:

```javascript
// Chạy một truy vấn trong src/sql/queries.js và in kết quả dạng bảng.
// Cách dùng: node scripts/run-query.js studentsPerCourse
const queries = require("../src/sql/queries");
const pool = require("../src/db/pool");

async function main() {
  const name = process.argv[2];
  if (!queries[name]) {
    console.log("Không có truy vấn", name, "- chọn một trong:", Object.keys(queries).join(", "));
  } else {
    const [rows] = await pool.query(queries[name]);
    console.table(rows);
  }
  await pool.end();
}

main().catch((error) => {
  console.error("Lỗi:", error.message);
  process.exit(1);
});
```

Chạy từng truy vấn:

```bash
node scripts/run-query.js enrollmentDetails
```

```text
┌─────────┬──────────────┬───────────────────┬───────────────────────┬─────────────┬──────────┐
│ (index) │ enrollmentId │ studentName       │ courseTitle           │ status      │ progress │
├─────────┼──────────────┼───────────────────┼───────────────────────┼─────────────┼──────────┤
│ 0       │ 1            │ 'Nguyễn Văn An'   │ 'HTML và CSS cơ bản'  │ 'completed' │ 100      │
│ 1       │ 2            │ 'Nguyễn Văn An'   │ 'JavaScript cơ bản'   │ 'completed' │ 100      │
│ 2       │ 3            │ 'Nguyễn Văn An'   │ 'ReactJS'             │ 'active'    │ 60       │
│ 3       │ 4            │ 'Trần Thị Bình'   │ 'JavaScript cơ bản'   │ 'completed' │ 100      │
│ 4       │ 5            │ 'Trần Thị Bình'   │ 'JavaScript nâng cao' │ 'active'    │ 40       │
│ 5       │ 6            │ 'Lê Minh Chi'     │ 'JavaScript cơ bản'   │ 'active'    │ 75       │
│ 6       │ 7            │ 'Lê Minh Chi'     │ 'ReactJS'             │ 'dropped'   │ 10       │
│ 7       │ 8            │ 'Phạm Quốc Dũng'  │ 'NodeJS và Express'   │ 'active'    │ 25       │
│ 8       │ 9            │ 'Phạm Quốc Dũng'  │ 'Cơ sở dữ liệu MySQL' │ 'completed' │ 100      │
│ 9       │ 10           │ 'Hoàng Thu Giang' │ 'Cơ sở dữ liệu MySQL' │ 'active'    │ 50       │
└─────────┴──────────────┴───────────────────┴───────────────────────┴─────────────┴──────────┘
```

```bash
node scripts/run-query.js studentsPerCourse
node scripts/run-query.js averageProgressPerCourse
```

```text
┌─────────┬──────────┬───────────────────────┬──────────────┐
│ (index) │ courseId │ title                 │ studentCount │
├─────────┼──────────┼───────────────────────┼──────────────┤
│ 0       │ 1        │ 'HTML và CSS cơ bản'  │ 1            │
│ 1       │ 2        │ 'JavaScript cơ bản'   │ 3            │
│ 2       │ 3        │ 'JavaScript nâng cao' │ 1            │
│ 3       │ 4        │ 'ReactJS'             │ 2            │
│ 4       │ 5        │ 'NodeJS và Express'   │ 1            │
│ 5       │ 6        │ 'Cơ sở dữ liệu MySQL' │ 2            │
└─────────┴──────────┴───────────────────────┴──────────────┘
┌─────────┬──────────┬───────────────────────┬─────────────┐
│ (index) │ courseId │ title                 │ avgProgress │
├─────────┼──────────┼───────────────────────┼─────────────┤
│ 0       │ 1        │ 'HTML và CSS cơ bản'  │ 100         │
│ 1       │ 2        │ 'JavaScript cơ bản'   │ 91.7        │
│ 2       │ 3        │ 'JavaScript nâng cao' │ 40          │
│ 3       │ 4        │ 'ReactJS'             │ 60          │
│ 4       │ 5        │ 'NodeJS và Express'   │ 25          │
│ 5       │ 6        │ 'Cơ sở dữ liệu MySQL' │ 75          │
└─────────┴──────────┴───────────────────────┴─────────────┘
```

`studentsPerCourse` ở đây đếm cả ghi danh `dropped` (khóa 4 có 2). `averageProgressPerCourse` loại `dropped` bằng `WHERE` nên khóa 4 chỉ còn một ghi danh với tiến độ 60. Truy vấn có `HAVING` giữ khóa có từ 2 học viên trở lên:

```bash
node scripts/run-query.js popularCourses
node scripts/run-query.js khongCo
```

```text
┌─────────┬──────────┬───────────────────────┬──────────────┐
│ (index) │ courseId │ title                 │ studentCount │
├─────────┼──────────┼───────────────────────┼──────────────┤
│ 0       │ 2        │ 'JavaScript cơ bản'   │ 3            │
│ 1       │ 6        │ 'Cơ sở dữ liệu MySQL' │ 2            │
└─────────┴──────────┴───────────────────────┴──────────────┘
Không có truy vấn khongCo - chọn một trong: enrollmentDetails, studentsPerCourse, averageProgressPerCourse, popularCourses
```

**Điểm kiểm tra Lab 2:**
- [ ] `npm run db:setup` in `Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_learn.`; `SHOW TABLES` có bốn bảng.
- [ ] Hai câu `LEFT JOIN` cho 6 hàng và 5 hàng; giải thích được vì sao khóa 1 biến mất.
- [ ] `averageProgressPerCourse` cho khóa 2 giá trị `91.7` và khóa 4 giá trị `60`.
- [ ] `popularCourses` chỉ có khóa 2 (3 học viên) và khóa 6 (2 học viên).

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| `Unknown database 'rikkei_learn'` | chưa chạy `npm run db:setup` | chạy `npm run db:setup` |
| Khóa chưa có học viên biến mất khỏi kết quả | điều kiện trạng thái đặt ở `WHERE` | chuyển điều kiện vào `ON` |
| Số học viên của khóa 1 là 1 thay vì 0 trong câu đếm `active` | dùng `COUNT(*)` hoặc đếm cả `completed` | đếm `COUNT(e.id)` và đặt `e.status = 'active'` trong `ON` |
| Cột `avgProgress` hiện chuỗi `"91.7"` | thiếu `decimalNumbers: true` trong `pool.js` | giữ nguyên `src/db/pool.js` của khuôn |

---

## Lab 3 - Repository `mysql2`, SQL injection và giao dịch (30 phút)

**Áp dụng:** Lesson 04

**Mục tiêu:** viết `courses.repository.js` (`findAll`, `findById`, `searchByTitle`, `create`) bằng truy vấn tham số hóa, thấy tận mắt vì sao nối chuỗi nguy hiểm, rồi viết `enrollStudent` bằng giao dịch (`getConnection`, `beginTransaction`, `commit`, `rollback`, `release` trong `finally`).

**Các bước thực hiện:**

**Bước 1. `courses.repository.js`.** Tạo tệp và một script thử:

Tệp `src/repositories/courses.repository.js`:

```javascript
const pool = require("../db/pool");

// Cột trả về cho API: snake_case của bảng đã khớp camelCase nên không cần AS.
const SELECT_COURSE = "SELECT id, title, description, level FROM courses";

// Mọi khóa học, theo id tăng dần.
async function findAll() {
  const [rows] = await pool.execute(SELECT_COURSE + " ORDER BY id");
  return rows;
}

// Một khóa học theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_COURSE + " WHERE id = ?", [id]);
  return rows[0] || null;
}

// Tìm theo tiêu đề chứa từ khóa. Dấu % ghép vào GIÁ TRỊ tham số, không ghép vào câu SQL.
async function searchByTitle(keyword) {
  const [rows] = await pool.execute(SELECT_COURSE + " WHERE title LIKE ? ORDER BY id", ["%" + keyword + "%"]);
  return rows;
}

// Tạo khóa học mới rồi đọc lại để trả đúng dạng JSON của API.
async function create({ title, description = "", level = "beginner" }) {
  const [result] = await pool.execute(
    "INSERT INTO courses (title, description, level) VALUES (?, ?, ?)",
    [title, description, level]
  );
  return findById(result.insertId);
}

module.exports = { findAll, findById, searchByTitle, create };
```

Tệp `scripts/try-courses.js`:

```javascript
// Thử các hàm của courses.repository và in kết quả.
const pool = require("../src/db/pool");
const coursesRepository = require("../src/repositories/courses.repository");

async function main() {
  const all = await coursesRepository.findAll();
  console.log("findAll:", all.length, "khóa học");
  console.log("findById(5):", await coursesRepository.findById(5));
  console.log("findById(999):", await coursesRepository.findById(999));
  const found = await coursesRepository.searchByTitle("javascript");
  console.log("searchByTitle('javascript'):", found.map((course) => course.title));
  const created = await coursesRepository.create({ title: "Docker cơ bản" });
  console.log("create:", created);
  await pool.end();
}

main().catch((error) => {
  console.error("Lỗi:", error.message);
  process.exit(1);
});
```

```bash
node scripts/try-courses.js
```

Kết quả mong đợi (khóa học vừa tạo có `id` 7 và mặc định `description` rỗng, `level` là `beginner`):

```text
findAll: 6 khóa học
findById(5): {
  id: 5,
  title: 'NodeJS và Express',
  description: 'Viết API với Express và MySQL.',
  level: 'intermediate'
}
findById(999): null
searchByTitle('javascript'): [ 'JavaScript cơ bản', 'JavaScript nâng cao' ]
create: { id: 7, title: 'Docker cơ bản', description: '', level: 'beginner' }
```

**Bước 2. SQL injection: nối chuỗi so với `?`.** Script dưới đây chạy hai cách với cùng chuỗi tấn công `' OR 1=1 -- `. Cách nối chuỗi chỉ để QUAN SÁT, không bao giờ làm thế này trong mã thật.

Tệp `scripts/try-injection.js`:

```javascript
// So sánh nối chuỗi với tham số hóa khi người dùng nhập một chuỗi tấn công.
const pool = require("../src/db/pool");
const coursesRepository = require("../src/repositories/courses.repository");

async function main() {
  const input = "' OR 1=1 -- ";

  // Cách SAI, chỉ để quan sát: không làm thế này trong mã thật. Dữ liệu người dùng nằm trong câu SQL.
  const unsafeSql = "SELECT id, title FROM courses WHERE title LIKE '%" + input + "%'";
  console.log("Câu SQL sau khi nối chuỗi:", unsafeSql);
  const [unsafeRows] = await pool.query(unsafeSql);
  console.log("Nối chuỗi trả", unsafeRows.length, "hàng");

  // Cách ĐÚNG: repository dùng dấu ?, dữ liệu người dùng chỉ là giá trị.
  const safeRows = await coursesRepository.searchByTitle(input);
  console.log("Dùng ? trả", safeRows.length, "hàng");

  await pool.end();
}

main().catch((error) => {
  console.error("Lỗi:", error.message);
  process.exit(1);
});
```

```bash
node scripts/try-injection.js
```

Kết quả mong đợi:

```text
Câu SQL sau khi nối chuỗi: SELECT id, title FROM courses WHERE title LIKE '%' OR 1=1 -- %'
Nối chuỗi trả 7 hàng
Dùng ? trả 0 hàng
```

Cách nối chuỗi biến điều kiện thành `LIKE '%' OR 1=1`, luôn đúng, nên trả mọi hàng (6 khóa mẫu và khóa "Docker cơ bản" vừa tạo). Với `?`, chuỗi đó chỉ là dữ liệu cần tìm trong tiêu đề nên không có hàng nào khớp.

**Bước 3. `enrollStudent` bằng giao dịch.** Tạo repository ghi danh (một hàm đọc và một hàm ghi nhiều bước) và script thử:

Tệp `src/repositories/enrollments.repository.js`:

```javascript
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Ghi danh kèm tên khóa học, đổi snake_case sang camelCase bằng AS.
const SELECT_ENROLLMENT =
  "SELECT e.id, e.user_id AS userId, e.course_id AS courseId, c.title AS courseTitle, " +
  "e.status, e.progress, e.enrolled_at AS enrolledAt " +
  "FROM enrollments e JOIN courses c ON c.id = e.course_id";

// Một ghi danh theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_ENROLLMENT + " WHERE e.id = ?", [id]);
  return rows[0] || null;
}

// Ghi danh học viên vào khóa học trong MỘT giao dịch: hoặc xong trọn vẹn, hoặc không đổi gì.
async function enrollStudent(userId, courseId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [courses] = await connection.execute("SELECT id FROM courses WHERE id = ?", [courseId]);
    if (courses.length === 0) {
      throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
    }
    const [lessons] = await connection.execute("SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?", [courseId]);
    if (lessons[0].total === 0) {
      throw httpError(409, "CONFLICT", "Khóa học chưa có bài học");
    }
    const [existing] = await connection.execute(
      "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    if (existing.length > 0) {
      throw httpError(409, "CONFLICT", "Học viên đã ghi danh khóa học này");
    }
    const [result] = await connection.execute(
      "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );

    await connection.commit();
    return findById(result.insertId);
  } catch (error) {
    await connection.rollback();
    // Lỗi MySQL đổi thành lỗi HTTP theo error.code.
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw httpError(400, "VALIDATION_ERROR", "Học viên không tồn tại");
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { findById, enrollStudent };
```

Tệp `scripts/try-enroll.js`:

```javascript
// Thử enrollStudent: một ca thành công và các ca lỗi, kèm số hàng của bảng enrollments sau mỗi ca.
// Cách dùng: node scripts/try-enroll.js <userId> <courseId>
const pool = require("../src/db/pool");
const enrollmentsRepository = require("../src/repositories/enrollments.repository");

async function countEnrollments() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM enrollments");
  return rows[0].total;
}

async function main() {
  const userId = Number(process.argv[2]);
  const courseId = Number(process.argv[3]);
  console.log("Trước:", await countEnrollments(), "hàng");
  try {
    const enrollment = await enrollmentsRepository.enrollStudent(userId, courseId);
    console.log("Thành công:", enrollment.id, enrollment.courseTitle, enrollment.status, enrollment.progress);
  } catch (error) {
    console.log("Lỗi", error.status, error.code, "-", error.message);
  }
  console.log("Sau:", await countEnrollments(), "hàng");
  await pool.end();
}

main();
```

Ghi danh học viên 2 vào khóa 5 (thành công), rồi xem hàng mới trong bảng:

```bash
node scripts/try-enroll.js 2 5
mysql -u root -p rikkei_learn -t -e "SELECT id, user_id, course_id, status, progress FROM enrollments WHERE id > 9"
```

Kết quả mong đợi:

```text
Trước: 10 hàng
Thành công: 11 NodeJS và Express active 0
Sau: 11 hàng
+----+---------+-----------+--------+----------+
| id | user_id | course_id | status | progress |
+----+---------+-----------+--------+----------+
| 10 |       6 |         6 | active |       50 |
| 11 |       2 |         5 | active |        0 |
+----+---------+-----------+--------+----------+
```

Bốn ca lỗi; số hàng của bảng `enrollments` KHÔNG đổi sau mỗi ca:

```bash
node scripts/try-enroll.js 2 5
node scripts/try-enroll.js 2 99
node scripts/try-enroll.js 2 7
node scripts/try-enroll.js 999 5
```

Kết quả mong đợi:

```text
Trước: 11 hàng
Lỗi 409 CONFLICT - Học viên đã ghi danh khóa học này
Sau: 11 hàng
Trước: 11 hàng
Lỗi 404 NOT_FOUND - Không tìm thấy khóa học
Sau: 11 hàng
Trước: 11 hàng
Lỗi 409 CONFLICT - Khóa học chưa có bài học
Sau: 11 hàng
Trước: 11 hàng
Lỗi 400 VALIDATION_ERROR - Học viên không tồn tại
Sau: 11 hàng
```

Ca cuối (học viên 999) vượt qua ba bước kiểm tra, đến `INSERT` thì MySQL báo lỗi khóa ngoại `ER_NO_REFERENCED_ROW_2`; `catch` gọi `rollback`, đổi lỗi thành 400 `Học viên không tồn tại`, và `finally` trả kết nối về pool. Quên `release` thì sau vài lần lỗi pool cạn kết nối và test treo.

**Bước 4. Đặt lại dữ liệu.** Chạy lại `npm run db:setup` để xóa khóa "Docker cơ bản" và ghi danh vừa tạo, đưa cơ sở dữ liệu về như ban đầu cho Lab 4.

**Điểm kiểm tra Lab 3:**
- [ ] `findById(999)` trả `null`, `searchByTitle('javascript')` trả hai khóa, `create` trả khóa có `id` 7.
- [ ] Cách nối chuỗi trả 7 hàng, cách dùng `?` trả 0 hàng.
- [ ] `enrollStudent(2, 5)` tạo ghi danh `id` 11 (`active`, tiến độ 0), bảng từ 10 lên 11 hàng.
- [ ] Bốn ca lỗi cho đúng bốn thông báo và bảng không đổi số hàng.
- [ ] Giải thích được vai trò của `rollback` trong `catch` và `release` trong `finally`.

**Lỗi hay gặp:** (hai lỗi cơ sở dữ liệu dưới đây được tạo lại thật)

Sai mật khẩu MySQL, chạy `DB_PASSWORD=sai-mat-khau node scripts/db-setup.js`:

```text
Không nạp được cơ sở dữ liệu: Access denied for user 'root'@'localhost' (using password: YES)
```

Tên cơ sở dữ liệu không có, chạy `DB_NAME=rikkei_learn_khong_co node scripts/try-courses.js`:

```text
Lỗi: Unknown database 'rikkei_learn_khong_co'
```

Cơ sở dữ liệu có nhưng chưa có bảng (chưa chạy `db:setup`), chạy `DB_NAME=rikkei_learn_trong node scripts/try-courses.js` với một cơ sở dữ liệu rỗng:

```text
Lỗi: Table 'rikkei_learn_trong.courses' doesn't exist
```

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| Script treo, không kết thúc | quên `await pool.end()` hoặc quên `connection.release()` | đóng pool ở cuối script; đặt `release` trong `finally` |
| `ER_DUP_ENTRY` hiện ra thay vì `Học viên đã ghi danh khóa học này` | bỏ bước kiểm tra ghi danh hiện có và không bắt `ER_DUP_ENTRY` | giữ bước `SELECT` kiểm tra trước `INSERT` |
| `Incorrect arguments to mysqld_stmt_execute` | dùng `pool.execute` cho `LIMIT ?` (Lab 4) | dùng `pool.query` cho `LIMIT` và `OFFSET` |

---

## Lab 4 - API `/courses` đầy đủ: zod, phân trang và lỗi tập trung (25 phút)

**Áp dụng:** Lesson 05

**Mục tiêu:** ráp bốn tầng `routes`, `controllers`, `repositories`, `schemas`; kiểm tra dữ liệu bằng `zod` và `validate`; làm `GET /courses` có phân trang và lọc `level`; mở rộng `errorHandler` cho lỗi MySQL; thấy `DELETE` bị chặn bởi khóa ngoại và `DELETE` kéo theo bài học (cascade).

**Các bước thực hiện:**

**Bước 1. Đặt lại dữ liệu và chép mã.** Chạy `npm run db:setup`. Sau đó ghi các tệp sau (ghi đè `courses.repository.js`, `errorHandler.js` và `courses.routes.js` của các lab trước; `src/data/courses.js` không còn dùng, có thể xóa).

```bash
npm run db:setup
```

```text

> rikkei-node-exercise@1.0.0 db:setup
> node scripts/db-setup.js

Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_learn.
```

Tệp `src/schemas/course.schema.js`:

```javascript
const { z } = require("zod");

const LEVELS = ["beginner", "intermediate", "advanced"];
const LEVEL_MESSAGE = "Cấp độ phải là beginner, intermediate hoặc advanced";

// Dữ liệu tạo mới (POST): trường lạ như id bị bỏ khỏi kết quả, description thiếu thì thành chuỗi rỗng.
const createCourseSchema = z.object({
  title: z
    .string({ required_error: "Tiêu đề không được để trống", invalid_type_error: "Tiêu đề phải là chuỗi" })
    .trim()
    .min(1, "Tiêu đề không được để trống")
    .max(120, "Tiêu đề tối đa 120 ký tự"),
  description: z
    .string({ invalid_type_error: "Mô tả phải là chuỗi" })
    .trim()
    .max(500, "Mô tả tối đa 500 ký tự")
    .default(""),
  level: z.enum(LEVELS, { message: LEVEL_MESSAGE }),
});

// Query string luôn là chuỗi nên dùng z.coerce.number() để ép sang số.
function queryInt(label) {
  return z.coerce.number({ invalid_type_error: label + " phải là số" }).int(label + " phải là số nguyên");
}

// Query của GET /courses: page, limit có mặc định; level là bộ lọc tùy chọn.
const listCoursesQuerySchema = z.object({
  page: queryInt("page").min(1, "page tối thiểu là 1").default(1),
  limit: queryInt("limit").min(1, "limit tối thiểu là 1").max(50, "limit tối đa là 50").default(5),
  level: z.enum(LEVELS, { message: LEVEL_MESSAGE }).optional(),
});

// Tham số :id trên URL cũng là chuỗi: ép sang số nguyên dương.
const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id phải là số" })
    .int("id phải là số nguyên")
    .positive("id phải lớn hơn 0"),
});

module.exports = { createCourseSchema, listCoursesQuerySchema, idParamSchema };
```

Tệp `src/middlewares/validate.js`:

```javascript
const httpError = require("../errors/httpError");

// Áp schema lên req.body, req.query hoặc req.params; sai thì chuyển lỗi 400, đúng thì thay nguồn bằng dữ liệu đã làm sạch.
function validate(schema, source) {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(httpError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", details));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
```

Tệp `src/middlewares/errorHandler.js` (thêm hai nhánh lỗi MySQL):

```javascript
// Middleware lỗi (đúng 4 tham số): nơi duy nhất biến lỗi thành phản hồi JSON chuẩn.
function errorHandler(err, req, res, next) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Lỗi máy chủ";
  let details;

  if (err.type === "entity.parse.failed") {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "JSON không hợp lệ";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    // Khóa ngoại trỏ tới hàng không tồn tại.
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Dữ liệu tham chiếu không tồn tại";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    // Hàng đang được bảng khác tham chiếu (khóa học đã có ghi danh) nên không xóa được.
    status = 409;
    code = "CONFLICT";
    message = "Khóa học đã có học viên ghi danh, không thể xóa";
  } else if (typeof err.status === "number" && err.code) {
    // Lỗi do httpError tạo.
    ({ status, code, message, details } = err);
  } else {
    console.error(err); // chỉ ghi nhật ký, không trả chi tiết cho client
  }

  const body = { error: { code, message } };
  if (details) body.error.details = details;
  res.status(status).json(body);
}

module.exports = errorHandler;
```

Tệp `src/repositories/courses.repository.js`:

```javascript
const pool = require("../db/pool");

// Cột trả về cho API: snake_case của bảng đã khớp camelCase nên không cần AS.
const SELECT_COURSE = "SELECT id, title, description, level FROM courses";

// Ghép điều kiện WHERE từ bộ lọc; mọi giá trị đi qua dấu ?.
function buildWhere({ level }) {
  if (!level) {
    return { where: "", params: [] };
  }
  return { where: " WHERE level = ?", params: [level] };
}

// Một trang khóa học. LIMIT/OFFSET dùng pool.query vì pool.execute đòi số nguyên đúng kiểu.
async function findAll(filters) {
  const { where, params } = buildWhere(filters);
  const offset = (filters.page - 1) * filters.limit;
  const [rows] = await pool.query(SELECT_COURSE + where + " ORDER BY id LIMIT ? OFFSET ?", [
    ...params,
    filters.limit,
    offset,
  ]);
  return rows;
}

// Tổng số khóa học khớp bộ lọc (dùng chung buildWhere để meta.total khớp với data).
async function count(filters) {
  const { where, params } = buildWhere(filters);
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM courses" + where, params);
  return rows[0].total;
}

// Một khóa học theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_COURSE + " WHERE id = ?", [id]);
  return rows[0] || null;
}

// Tạo khóa học mới rồi đọc lại để trả đúng dạng JSON của API.
async function create({ title, description = "", level = "beginner" }) {
  const [result] = await pool.execute(
    "INSERT INTO courses (title, description, level) VALUES (?, ?, ?)",
    [title, description, level]
  );
  return findById(result.insertId);
}

// Xóa theo id; trả true nếu đã xóa một hàng, false nếu không có hàng nào.
async function remove(id) {
  const [result] = await pool.execute("DELETE FROM courses WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, count, findById, create, remove };
```

Tệp `src/repositories/lessons.repository.js`:

```javascript
const pool = require("../db/pool");

// Các bài học của một khóa học, theo thứ tự position; khóa không có bài học thì trả mảng rỗng.
async function findByCourse(courseId) {
  const [rows] = await pool.execute(
    "SELECT id, title, position FROM lessons WHERE course_id = ? ORDER BY position",
    [courseId]
  );
  return rows;
}

module.exports = { findByCourse };
```

Tệp `src/controllers/courses.controller.js`:

```javascript
const coursesRepository = require("../repositories/courses.repository");
const lessonsRepository = require("../repositories/lessons.repository");
const httpError = require("../errors/httpError");

// Tìm khóa học theo id hoặc báo 404; dùng chung cho các route có :id.
async function requireCourse(id) {
  const course = await coursesRepository.findById(id);
  if (!course) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  }
  return course;
}

// GET /courses: một trang khóa học kèm meta phân trang.
async function listCourses(req, res) {
  const filters = req.query;
  const data = await coursesRepository.findAll(filters);
  const total = await coursesRepository.count(filters);
  res.json({
    data,
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  });
}

// GET /courses/:id
async function getCourse(req, res) {
  res.json(await requireCourse(req.params.id));
}

// GET /courses/:id/lessons: mảng bài học (không phân trang).
async function listCourseLessons(req, res) {
  await requireCourse(req.params.id);
  res.json(await lessonsRepository.findByCourse(req.params.id));
}

// POST /courses
async function createCourse(req, res) {
  const course = await coursesRepository.create(req.body);
  res.status(201).json(course);
}

// DELETE /courses/:id: bài học bị xóa theo (ON DELETE CASCADE); khóa đã có ghi danh thì MySQL từ chối.
async function deleteCourse(req, res) {
  const removed = await coursesRepository.remove(req.params.id);
  if (!removed) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
  }
  res.sendStatus(204);
}

module.exports = { listCourses, getCourse, listCourseLessons, createCourse, deleteCourse };
```

Tệp `src/routes/courses.routes.js`:

```javascript
const express = require("express");
const controller = require("../controllers/courses.controller");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { createCourseSchema, listCoursesQuerySchema, idParamSchema } = require("../schemas/course.schema");

const router = express.Router();

router.get("/", validate(listCoursesQuerySchema, "query"), asyncHandler(controller.listCourses));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getCourse));
router.get("/:id/lessons", validate(idParamSchema, "params"), asyncHandler(controller.listCourseLessons));
router.post("/", validate(createCourseSchema, "body"), asyncHandler(controller.createCourse));
router.delete("/:id", validate(idParamSchema, "params"), asyncHandler(controller.deleteCourse));

module.exports = router;
```

`src/app.js` giữ nguyên bản của Lab 1 Bước 4 (đã có `express.json()`, router `/courses`, `notFound`, `errorHandler`). Khi lưu xong, `npm run dev` in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

**Bước 2. Danh sách có phân trang và lọc.**

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses
```

Kết quả mong đợi (5 khóa đầu và `meta`):

```text
{"data":[{"id":1,"title":"HTML và CSS cơ bản","description":"Dựng trang web tĩnh từ đầu.","level":"beginner"},{"id":2,"title":"JavaScript cơ bản","description":"Biến, hàm, mảng, đối tượng.","level":"beginner"},{"id":3,"title":"JavaScript nâng cao","description":"Bất đồng bộ và gọi API.","level":"intermediate"},{"id":4,"title":"ReactJS","description":"Xây giao diện bằng component.","level":"intermediate"},{"id":5,"title":"NodeJS và Express","description":"Viết API với Express và MySQL.","level":"intermediate"}],"meta":{"page":1,"limit":5,"total":6,"totalPages":2}}
HTTP 200
```

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses?level=beginner&limit=2&page=2"
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses?page=9"
```

Kết quả mong đợi (lọc `beginner` có 3 khóa, mỗi trang 2; trang 9 vẫn là 200 với `data` rỗng):

```text
{"data":[{"id":6,"title":"Cơ sở dữ liệu MySQL","description":"Thiết kế bảng và truy vấn SQL.","level":"beginner"}],"meta":{"page":2,"limit":2,"total":3,"totalPages":2}}
HTTP 200
{"data":[],"meta":{"page":9,"limit":5,"total":6,"totalPages":2}}
HTTP 200
```

**Bước 3. Dữ liệu sai bị chặn ở cửa.**

```bash
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/courses?page=0&limit=100&level=expert"
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/abc
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{}'
```

Kết quả mong đợi (`details` theo thứ tự trường của schema):

```text
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"page","message":"page tối thiểu là 1"},{"field":"limit","message":"limit tối đa là 50"},{"field":"level","message":"Cấp độ phải là beginner, intermediate hoặc advanced"}]}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"id","message":"id phải là số"}]}}
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"title","message":"Tiêu đề không được để trống"},{"field":"level","message":"Cấp độ phải là beginner, intermediate hoặc advanced"}]}}
HTTP 400
```

**Bước 4. Chi tiết, bài học và tạo mới.**

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/5/lessons
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/999
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"id":99,"title":"  Docker cơ bản  ","level":"beginner"}'
```

Kết quả mong đợi (`id` 99 trong body bị bỏ qua, tiêu đề được cắt khoảng trắng):

```text
[{"id":12,"title":"Express cơ bản","position":1},{"id":13,"title":"MySQL với mysql2","position":2}]
HTTP 200
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy khóa học"}}
HTTP 404
{"id":7,"title":"Docker cơ bản","description":"","level":"beginner"}
HTTP 201
```

**Bước 5. `DELETE`: khóa ngoại và cascade.** Khóa 1 đã có ghi danh nên MySQL từ chối (`ER_ROW_IS_REFERENCED_2`), `errorHandler` đổi thành 409:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X DELETE http://localhost:3000/courses/1
```

```text
{"error":{"code":"CONFLICT","message":"Khóa học đã có học viên ghi danh, không thể xóa"}}
HTTP 409
```

Thêm hai bài học cho khóa 7 vừa tạo, rồi xóa khóa 7 và đếm lại bài học:

```bash
mysql -u root -p rikkei_learn -t -e "INSERT INTO lessons (course_id, title, position) VALUES (7, 'Cài đặt', 1), (7, 'Container', 2); SELECT id, course_id, title FROM lessons WHERE course_id = 7"
curl -s -w "HTTP %{http_code}\n" -X DELETE http://localhost:3000/courses/7
mysql -u root -p rikkei_learn -t -e "SELECT COUNT(*) AS lessonsOfCourse7 FROM lessons WHERE course_id = 7; SELECT COUNT(*) AS totalLessons FROM lessons"
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/courses/7
```

Kết quả mong đợi (bài học của khóa 7 bị xóa theo nhờ `ON DELETE CASCADE`, tổng còn 15):

```text
+----+-----------+-------------+
| id | course_id | title       |
+----+-----------+-------------+
| 16 |         7 | Cài đặt     |
| 17 |         7 | Container   |
+----+-----------+-------------+
HTTP 204
+------------------+
| lessonsOfCourse7 |
+------------------+
|                0 |
+------------------+
+--------------+
| totalLessons |
+--------------+
|           15 |
+--------------+
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy khóa học"}}
HTTP 404
```

**Điểm kiểm tra Lab 4:**
- [ ] `GET /courses` trả `data` có 5 khóa và `meta` là `{ page: 1, limit: 5, total: 6, totalPages: 2 }`.
- [ ] `?level=beginner&limit=2&page=2` trả đúng khóa 6 và `total` 3.
- [ ] `?page=0&limit=100&level=expert` trả 400 với ba mục `details` theo thứ tự `page`, `limit`, `level`.
- [ ] `DELETE /courses/1` trả 409 `Khóa học đã có học viên ghi danh, không thể xóa`; `DELETE /courses/7` trả 204 và bài học của khóa 7 về 0.
- [ ] Giải thích được vì sao `LIMIT ?` dùng `pool.query`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| `Lỗi máy chủ` ở `GET /courses` và terminal báo `Incorrect arguments to mysqld_stmt_execute` | dùng `pool.execute` cho `LIMIT ? OFFSET ?` | dùng `pool.query` |
| `page` trong controller vẫn là chuỗi | `validate` quên gán `req[source] = result.data` | gán lại sau khi `safeParse` thành công |
| `meta.total` khác số khóa trong `data` khi lọc | `count` không dùng cùng điều kiện `WHERE` | dùng chung hàm `buildWhere` |
| `DELETE /courses/1` trả `Lỗi máy chủ` | `errorHandler` chưa có nhánh `ER_ROW_IS_REFERENCED_2` | thêm nhánh trả 409 |

---

## Lab 5 - Xác thực, phân quyền và ghi danh (30 phút)

**Áp dụng:** Lesson 06

**Mục tiêu:** đăng ký (băm mật khẩu bằng `bcryptjs`), đăng nhập (cấp JWT), `authenticate`, `authorize`; bảo vệ route ghi của khóa học; học viên ghi danh bằng `enrollStudent`, xem `GET /me/enrollments` và chỉ sửa được ghi danh của mình.

**Các bước thực hiện:**

**Bước 1. Đăng ký và đăng nhập.** Chạy `npm run db:setup`. Tạo các tệp sau; ghi đè `src/routes/courses.routes.js` (thêm bảo vệ cho `POST` và `DELETE`) và `src/app.js` (gắn `/auth`).

```bash
npm run db:setup
```

```text

> rikkei-node-exercise@1.0.0 db:setup
> node scripts/db-setup.js

Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_learn.
```

Tệp `src/repositories/users.repository.js`:

```javascript
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Đổi snake_case sang camelCase bằng AS. Hàng này có passwordHash nên KHÔNG trả thẳng cho client.
const SELECT_USER = "SELECT id, email, password_hash AS passwordHash, full_name AS fullName, role FROM users";

// Một người dùng theo email (đã chuẩn hóa chữ thường); không có thì trả null.
async function findByEmail(email) {
  const [rows] = await pool.execute(SELECT_USER + " WHERE email = ?", [email]);
  return rows[0] || null;
}

// Một người dùng theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_USER + " WHERE id = ?", [id]);
  return rows[0] || null;
}

// Tạo tài khoản student; email trùng làm MySQL ném ER_DUP_ENTRY, đổi thành lỗi 409.
async function create({ email, passwordHash, fullName }) {
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)",
      [email, passwordHash, fullName]
    );
    return findById(result.insertId);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw httpError(409, "CONFLICT", "Email đã được đăng ký");
    }
    throw error;
  }
}

module.exports = { findByEmail, findById, create };
```

Tệp `src/schemas/auth.schema.js`:

```javascript
const { z } = require("zod");

// Đăng ký: email chuẩn hóa chữ thường, mật khẩu 8 đến 72 ký tự (bcrypt chỉ đọc 72 byte đầu).
// Trường lạ như role bị zod bỏ khỏi kết quả nên tài khoản mới luôn là student.
const registerSchema = z.object({
  email: z
    .string({ required_error: "Email là bắt buộc", invalid_type_error: "Email phải là chuỗi" })
    .trim()
    .toLowerCase()
    .email("Email không hợp lệ")
    .max(100, "Email tối đa 100 ký tự"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc", invalid_type_error: "Mật khẩu phải là chuỗi" })
    .min(8, "Mật khẩu phải có từ 8 đến 72 ký tự")
    .max(72, "Mật khẩu phải có từ 8 đến 72 ký tự"),
  fullName: z
    .string({ required_error: "Họ tên không được để trống", invalid_type_error: "Họ tên phải là chuỗi" })
    .trim()
    .min(1, "Họ tên không được để trống")
    .max(100, "Họ tên tối đa 100 ký tự"),
});

// Đăng nhập chỉ cần có đủ hai trường; đúng hay sai do controller quyết định để thông báo không tiết lộ gì.
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email là bắt buộc", invalid_type_error: "Email phải là chuỗi" })
    .trim()
    .toLowerCase()
    .min(1, "Email là bắt buộc"),
  password: z
    .string({ required_error: "Mật khẩu là bắt buộc", invalid_type_error: "Mật khẩu phải là chuỗi" })
    .min(1, "Mật khẩu là bắt buộc"),
});

module.exports = { registerSchema, loginSchema };
```

Tệp `src/controllers/auth.controller.js`:

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const usersRepository = require("../repositories/users.repository");
const httpError = require("../errors/httpError");

// Chỉ chọn các trường công khai: passwordHash không bao giờ rời khỏi máy chủ.
function toPublicUser(user) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

// POST /auth/register: băm mật khẩu rồi tạo tài khoản student; trả người dùng công khai (201).
async function register(req, res) {
  const { email, password, fullName } = req.body;
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const user = await usersRepository.create({ email, passwordHash, fullName });
  res.status(201).json(toPublicUser(user));
}

// POST /auth/login: email lạ và mật khẩu sai dùng chung một thông báo để không lộ email nào đã đăng ký.
async function login(req, res) {
  const { email, password } = req.body;
  const user = await usersRepository.findByEmail(email);
  const matched = user !== null && (await bcrypt.compare(password, user.passwordHash));
  if (!matched) {
    throw httpError(401, "UNAUTHORIZED", "Email hoặc mật khẩu không đúng");
  }
  // sub là chuỗi theo chuẩn JWT; authenticate sẽ đổi lại thành số.
  const token = jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
  res.json({ token, user: toPublicUser(user) });
}

// GET /auth/me: thông tin công khai của người đang đăng nhập (đọc lại từ cơ sở dữ liệu).
async function me(req, res) {
  const user = await usersRepository.findById(req.user.id);
  if (!user) {
    throw httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực");
  }
  res.json(toPublicUser(user));
}

module.exports = { register, login, me };
```

Tệp `src/middlewares/authenticate.js`:

```javascript
const jwt = require("jsonwebtoken");
const config = require("../config/env");
const httpError = require("../errors/httpError");

// Đọc header Authorization: Bearer <token>, kiểm tra token và gắn req.user = { id, role }.
// Thiếu, sai chữ ký hay hết hạn đều là 401 với cùng một thông báo.
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực"));
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // sub là chuỗi trong token, đổi lại thành số để so sánh với id trong cơ sở dữ liệu.
    req.user = { id: Number(payload.sub), role: payload.role };
    next();
  } catch (error) {
    next(httpError(401, "UNAUTHORIZED", "Thiếu hoặc sai mã xác thực"));
  }
}

module.exports = authenticate;
```

Tệp `src/middlewares/authorize.js`:

```javascript
const httpError = require("../errors/httpError");

// authorize("admin") trả về middleware kiểm req.user.role; phải đứng SAU authenticate.
function authorize(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
    }
    next();
  };
}

module.exports = authorize;
```

Tệp `src/routes/auth.routes.js`:

```javascript
const express = require("express");
const controller = require("../controllers/auth.controller");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { registerSchema, loginSchema } = require("../schemas/auth.schema");

const router = express.Router();

router.post("/register", validate(registerSchema, "body"), asyncHandler(controller.register));
router.post("/login", validate(loginSchema, "body"), asyncHandler(controller.login));
router.get("/me", authenticate, asyncHandler(controller.me));

module.exports = router;
```

Tệp `src/routes/courses.routes.js` (route đọc công khai; `POST` và `DELETE` qua `authenticate`, `authorize("admin")`, `validate`):

```javascript
const express = require("express");
const controller = require("../controllers/courses.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { createCourseSchema, listCoursesQuerySchema, idParamSchema } = require("../schemas/course.schema");

const router = express.Router();

// Xem khóa học: công khai, không cần đăng nhập.
router.get("/", validate(listCoursesQuerySchema, "query"), asyncHandler(controller.listCourses));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getCourse));
router.get("/:id/lessons", validate(idParamSchema, "params"), asyncHandler(controller.listCourseLessons));

// Tạo và xóa khóa học: chỉ admin. Thứ tự: authenticate, authorize, validate, controller.
router.post("/", authenticate, authorize("admin"), validate(createCourseSchema, "body"), asyncHandler(controller.createCourse));
router.delete("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), asyncHandler(controller.deleteCourse));

module.exports = router;
```

Tệp `src/app.js` (thêm `authRouter`):

```javascript
const express = require("express");
const authRouter = require("./routes/auth.routes");
const coursesRouter = require("./routes/courses.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/courses", coursesRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Tạo hai script hỗ trợ khi thử bằng dòng lệnh: `scripts/get-token.js` in token đăng nhập, `scripts/pick.js` chỉ in các trường được chọn của JSON (để bỏ `enrolledAt` phụ thuộc múi giờ).

Tệp `scripts/get-token.js`:

```javascript
// In ra token đăng nhập để gán vào biến khi thử bằng cURL.
// Cách dùng: node scripts/get-token.js an@rikkei.edu Matkhau123
// Máy chủ phải đang chạy ở cổng PORT (mặc định 3000). Cần Node.js 18 trở lên (có sẵn fetch).
const port = process.env.PORT || 3000;

async function main() {
  const [email, password] = process.argv.slice(2);
  const response = await fetch(`http://localhost:${port}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  if (!response.ok) {
    console.error("Đăng nhập thất bại:", response.status, body.error.message);
    process.exit(1);
  }
  console.log(body.token);
}

main();
```

Tệp `scripts/pick.js`:

```javascript
// Đọc JSON từ đầu vào chuẩn và chỉ in các trường được chọn (bỏ trường phụ thuộc múi giờ như enrolledAt).
// Cách dùng: curl -s ... | node scripts/pick.js id status progress
const fields = process.argv.slice(2);
let text = "";

process.stdin.on("data", (chunk) => {
  text += chunk;
});

process.stdin.on("end", () => {
  // Dòng cuối "HTTP 200" (do curl -w in ra) được giữ lại và in sau JSON.
  const lines = text.trimEnd().split("\n");
  const last = lines[lines.length - 1];
  const statusLine = last.startsWith("HTTP ") ? lines.pop() : null;
  const data = JSON.parse(lines.join("\n"));
  const pick = (item) => Object.fromEntries(fields.map((field) => [field, item[field]]));
  console.log(JSON.stringify(Array.isArray(data) ? data.map(pick) : pick(data)));
  if (statusLine) console.log(statusLine);
});
```

Khi lưu xong, terminal chạy `npm run dev` in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Đăng ký học viên mới, cố tình gửi `role` là `admin`, email có khoảng trắng và chữ hoa:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"  Minh@Rikkei.edu ","password":"Matkhau123","fullName":"Lê Văn Minh","role":"admin"}'
```

Kết quả mong đợi (`role` luôn là `student`, email đã chuẩn hóa, không có `passwordHash`):

```text
{"id":7,"email":"minh@rikkei.edu","fullName":"Lê Văn Minh","role":"student"}
HTTP 201
```

Xem hàng vừa tạo trong bảng `users`: mật khẩu là chuỗi băm 60 ký tự bắt đầu `$2a$10$` (10 là số vòng từ `BCRYPT_ROUNDS`):

```bash
mysql -u root -p rikkei_learn -t -e "SELECT id, email, role, LEFT(password_hash, 7) AS prefix, CHAR_LENGTH(password_hash) AS len FROM users WHERE id = 7"
```

```text
+----+-----------------+---------+---------+-----+
| id | email           | role    | prefix  | len |
+----+-----------------+---------+---------+-----+
|  7 | minh@rikkei.edu | student | $2a$10$ |  60 |
+----+-----------------+---------+---------+-----+
```

Đăng ký trùng email (viết hoa khác vẫn trùng) và dữ liệu sai:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"AN@rikkei.edu","password":"Matkhau123","fullName":"Người trùng"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d '{"email":"abc","password":"123","fullName":""}'
```

```text
{"error":{"code":"CONFLICT","message":"Email đã được đăng ký"}}
HTTP 409
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"email","message":"Email không hợp lệ"},{"field":"password","message":"Mật khẩu phải có từ 8 đến 72 ký tự"},{"field":"fullName","message":"Họ tên không được để trống"}]}}
HTTP 400
```

**Bước 2. Đăng nhập và đọc token.** Đăng nhập đúng trả `{ token, user }`; lệnh dưới chỉ in `user` (token là chuỗi dài khác nhau mỗi lần):

```bash
curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"an@rikkei.edu","password":"Matkhau123"}' | node scripts/pick.js user
```

```text
{"user":{"id":2,"email":"an@rikkei.edu","fullName":"Nguyễn Văn An","role":"student"}}
```

Sai mật khẩu và email lạ cho cùng một thông báo:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"an@rikkei.edu","password":"SaiMatKhau1"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"khongco@rikkei.edu","password":"Matkhau123"}'
```

```text
{"error":{"code":"UNAUTHORIZED","message":"Email hoặc mật khẩu không đúng"}}
HTTP 401
{"error":{"code":"UNAUTHORIZED","message":"Email hoặc mật khẩu không đúng"}}
HTTP 401
```

Lấy token vào biến (Git Bash; PowerShell dùng `$ADMIN = node ...`) và đọc payload của token học viên `an`: `sub` là CHUỖI `"2"`, `role` là `student`, hạn dùng 3600 giây:

```bash
ADMIN=$(node scripts/get-token.js admin@rikkei.edu Matkhau123)
AN=$(node scripts/get-token.js an@rikkei.edu Matkhau123)
BINH=$(node scripts/get-token.js binh@rikkei.edu Matkhau123)
node -e "const p = JSON.parse(Buffer.from(process.argv[1].split('.')[1], 'base64url')); console.log(p.sub, typeof p.sub, p.role, p.exp - p.iat)" "$AN"
```

```text
2 string student 3600
```

(Bốn giá trị in ra theo thứ tự: `sub`, kiểu của `sub`, `role`, và `exp - iat` tính bằng giây.)

**Bước 3. `authenticate` và `/auth/me`.**

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/auth/me
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/auth/me -H "Authorization: Bearer abc.def.ghi"
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/auth/me -H "Authorization: Bearer $AN"
```

Kết quả mong đợi (thiếu token và token rác cùng 401 một thông báo):

```text
{"error":{"code":"UNAUTHORIZED","message":"Thiếu hoặc sai mã xác thực"}}
HTTP 401
{"error":{"code":"UNAUTHORIZED","message":"Thiếu hoặc sai mã xác thực"}}
HTTP 401
{"id":2,"email":"an@rikkei.edu","fullName":"Nguyễn Văn An","role":"student"}
HTTP 200
```

**Bước 4. `authorize` và thứ tự middleware.** Tạo khóa học với ba loại token:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -d '{"title":"Docker cơ bản","level":"beginner"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -H "Authorization: Bearer $AN" -d '{"title":"Docker cơ bản","level":"beginner"}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN" -d '{"title":"Docker cơ bản","level":"beginner"}'
```

```text
{"error":{"code":"UNAUTHORIZED","message":"Thiếu hoặc sai mã xác thực"}}
HTTP 401
{"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thực hiện thao tác này"}}
HTTP 403
{"id":7,"title":"Docker cơ bản","description":"","level":"beginner"}
HTTP 201
```

Cùng body rỗng `{}`: học viên bị chặn ở `authorize` (403, chưa tới `validate`), admin tới `validate` (400):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -H "Authorization: Bearer $AN" -d '{}'
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN" -d '{}'
```

```text
{"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thực hiện thao tác này"}}
HTTP 403
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"title","message":"Tiêu đề không được để trống"},{"field":"level","message":"Cấp độ phải là beginner, intermediate hoặc advanced"}]}}
HTTP 400
```

**Bước 5. Ghi danh và quyền sở hữu.** Thêm các tệp sau (ghi đè `enrollments.repository.js` của Lab 3 bằng bản có thêm `findByUser` và `updateProgress`, `courses.routes.js` và `app.js`):

Tệp `src/repositories/enrollments.repository.js`:

```javascript
const pool = require("../db/pool");
const httpError = require("../errors/httpError");

// Ghi danh kèm tên khóa học, đổi snake_case sang camelCase bằng AS.
const SELECT_ENROLLMENT =
  "SELECT e.id, e.user_id AS userId, e.course_id AS courseId, c.title AS courseTitle, " +
  "e.status, e.progress, e.enrolled_at AS enrolledAt " +
  "FROM enrollments e JOIN courses c ON c.id = e.course_id";

// Một ghi danh theo id; không có thì trả null.
async function findById(id) {
  const [rows] = await pool.execute(SELECT_ENROLLMENT + " WHERE e.id = ?", [id]);
  return rows[0] || null;
}

// Mọi ghi danh của một học viên, theo id tăng dần.
async function findByUser(userId) {
  const [rows] = await pool.execute(SELECT_ENROLLMENT + " WHERE e.user_id = ? ORDER BY e.id", [userId]);
  return rows;
}

// Ghi danh học viên vào khóa học trong MỘT giao dịch: hoặc xong trọn vẹn, hoặc không đổi gì.
async function enrollStudent(userId, courseId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [courses] = await connection.execute("SELECT id FROM courses WHERE id = ?", [courseId]);
    if (courses.length === 0) {
      throw httpError(404, "NOT_FOUND", "Không tìm thấy khóa học");
    }
    const [lessons] = await connection.execute("SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?", [courseId]);
    if (lessons[0].total === 0) {
      throw httpError(409, "CONFLICT", "Khóa học chưa có bài học");
    }
    const [existing] = await connection.execute(
      "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    if (existing.length > 0) {
      throw httpError(409, "CONFLICT", "Học viên đã ghi danh khóa học này");
    }
    const [result] = await connection.execute(
      "INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );

    await connection.commit();
    return findById(result.insertId);
  } catch (error) {
    await connection.rollback();
    // Lỗi MySQL đổi thành lỗi HTTP theo error.code.
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw httpError(400, "VALIDATION_ERROR", "Học viên không tồn tại");
    }
    throw error;
  } finally {
    connection.release();
  }
}

// Cập nhật tiến độ: đủ 100 thì hoàn thành, dưới 100 thì đang học; trả ghi danh sau khi sửa.
async function updateProgress(enrollmentId, progress) {
  const status = progress === 100 ? "completed" : "active";
  await pool.execute("UPDATE enrollments SET progress = ?, status = ? WHERE id = ?", [progress, status, enrollmentId]);
  return findById(enrollmentId);
}

module.exports = { findById, findByUser, enrollStudent, updateProgress };
```

Tệp `src/schemas/enrollment.schema.js`:

```javascript
const { z } = require("zod");

const PROGRESS_MESSAGE = "Tiến độ phải là số nguyên từ 0 đến 100";

// Tham số :id của ghi danh trên URL (chuỗi, ép sang số nguyên dương).
const enrollmentIdParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "id phải là số" })
    .int("id phải là số nguyên")
    .positive("id phải lớn hơn 0"),
});

// Body của PATCH /enrollments/:id/progress: progress là số nguyên 0-100.
const progressBodySchema = z.object({
  progress: z
    .number({ required_error: PROGRESS_MESSAGE, invalid_type_error: PROGRESS_MESSAGE })
    .int(PROGRESS_MESSAGE)
    .min(0, PROGRESS_MESSAGE)
    .max(100, PROGRESS_MESSAGE),
});

module.exports = { enrollmentIdParamSchema, progressBodySchema };
```

Tệp `src/controllers/enrollments.controller.js`:

```javascript
const enrollmentsRepository = require("../repositories/enrollments.repository");
const httpError = require("../errors/httpError");

// GET /me/enrollments: ghi danh của chính người đang đăng nhập (id lấy từ token, không từ URL).
async function listMyEnrollments(req, res) {
  res.json(await enrollmentsRepository.findByUser(req.user.id));
}

// POST /courses/:id/enroll: ghi danh người đang đăng nhập vào khóa học; mọi lỗi nghiệp vụ do enrollStudent ném.
async function enrollInCourse(req, res) {
  const enrollment = await enrollmentsRepository.enrollStudent(req.user.id, req.params.id);
  res.status(201).json(enrollment);
}

// PATCH /enrollments/:id/progress: chỉ chủ ghi danh hoặc admin được sửa (kiểm tra quyền sở hữu).
async function updateEnrollmentProgress(req, res) {
  const enrollment = await enrollmentsRepository.findById(req.params.id);
  if (!enrollment) {
    throw httpError(404, "NOT_FOUND", "Không tìm thấy ghi danh");
  }
  if (req.user.role !== "admin" && enrollment.userId !== req.user.id) {
    throw httpError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  }
  res.json(await enrollmentsRepository.updateProgress(enrollment.id, req.body.progress));
}

module.exports = { listMyEnrollments, enrollInCourse, updateEnrollmentProgress };
```

Tệp `src/routes/me.routes.js`:

```javascript
const express = require("express");
const controller = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const asyncHandler = require("../middlewares/asyncHandler");

const router = express.Router();

// Dữ liệu riêng của người đang đăng nhập (gắn ở /me).
router.get("/enrollments", authenticate, asyncHandler(controller.listMyEnrollments));

module.exports = router;
```

Tệp `src/routes/enrollments.routes.js`:

```javascript
const express = require("express");
const controller = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { enrollmentIdParamSchema, progressBodySchema } = require("../schemas/enrollment.schema");

const router = express.Router();

// Thứ tự: authenticate (biết bạn là ai), validate (dữ liệu đúng dạng), controller (quyền sở hữu).
router.patch(
  "/:id/progress",
  authenticate,
  validate(enrollmentIdParamSchema, "params"),
  validate(progressBodySchema, "body"),
  asyncHandler(controller.updateEnrollmentProgress)
);

module.exports = router;
```

Tệp `src/routes/courses.routes.js` (thêm `POST /:id/enroll` chỉ cho `student`):

```javascript
const express = require("express");
const controller = require("../controllers/courses.controller");
const enrollmentsController = require("../controllers/enrollments.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { createCourseSchema, listCoursesQuerySchema, idParamSchema } = require("../schemas/course.schema");

const router = express.Router();

// Xem khóa học: công khai, không cần đăng nhập.
router.get("/", validate(listCoursesQuerySchema, "query"), asyncHandler(controller.listCourses));
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(controller.getCourse));
router.get("/:id/lessons", validate(idParamSchema, "params"), asyncHandler(controller.listCourseLessons));

// Ghi danh: chỉ học viên (student); học viên là người trong token, không lấy từ body.
router.post(
  "/:id/enroll",
  authenticate,
  authorize("student"),
  validate(idParamSchema, "params"),
  asyncHandler(enrollmentsController.enrollInCourse)
);

// Tạo và xóa khóa học: chỉ admin. Thứ tự: authenticate, authorize, validate, controller.
router.post("/", authenticate, authorize("admin"), validate(createCourseSchema, "body"), asyncHandler(controller.createCourse));
router.delete("/:id", authenticate, authorize("admin"), validate(idParamSchema, "params"), asyncHandler(controller.deleteCourse));

module.exports = router;
```

Tệp `src/app.js` (thêm `/me` và `/enrollments`):

```javascript
const express = require("express");
const authRouter = require("./routes/auth.routes");
const meRouter = require("./routes/me.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const coursesRouter = require("./routes/courses.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/courses", coursesRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Sau khi lưu, terminal in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Học viên `an` xem ghi danh của mình, rồi ghi danh khóa 5 và ghi danh lần hai:

```bash
curl -s http://localhost:3000/me/enrollments -H "Authorization: Bearer $AN" | node scripts/pick.js id courseTitle status progress
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses/5/enroll -H "Authorization: Bearer $AN" | node scripts/pick.js id userId courseId courseTitle status progress
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses/5/enroll -H "Authorization: Bearer $AN"
```

```text
[{"id":1,"courseTitle":"HTML và CSS cơ bản","status":"completed","progress":100},{"id":2,"courseTitle":"JavaScript cơ bản","status":"completed","progress":100},{"id":3,"courseTitle":"ReactJS","status":"active","progress":60}]
{"id":11,"userId":2,"courseId":5,"courseTitle":"NodeJS và Express","status":"active","progress":0}
HTTP 201
{"error":{"code":"CONFLICT","message":"Học viên đã ghi danh khóa học này"}}
HTTP 409
```

Admin không được ghi danh (chỉ `student`), không token thì 401, khóa không có thì 404, và `binh` chỉ thấy ghi danh của mình:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses/5/enroll -H "Authorization: Bearer $ADMIN"
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses/5/enroll
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3000/courses/99/enroll -H "Authorization: Bearer $AN"
curl -s http://localhost:3000/me/enrollments -H "Authorization: Bearer $BINH" | node scripts/pick.js id courseTitle status progress
```

```text
{"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thực hiện thao tác này"}}
HTTP 403
{"error":{"code":"UNAUTHORIZED","message":"Thiếu hoặc sai mã xác thực"}}
HTTP 401
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy khóa học"}}
HTTP 404
[{"id":4,"courseTitle":"JavaScript cơ bản","status":"completed","progress":100},{"id":5,"courseTitle":"JavaScript nâng cao","status":"active","progress":40}]
```

Quyền sở hữu: `an` cập nhật tiến độ ghi danh 3 của chính mình; `binh` thử sửa ghi danh đó; tiến độ sai; admin được sửa của người khác; ghi danh không có:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/enrollments/3/progress -H "Content-Type: application/json" -H "Authorization: Bearer $AN" -d '{"progress":80}' | node scripts/pick.js id userId status progress
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/enrollments/3/progress -H "Content-Type: application/json" -H "Authorization: Bearer $BINH" -d '{"progress":90}'
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/enrollments/3/progress -H "Content-Type: application/json" -H "Authorization: Bearer $AN" -d '{"progress":150}'
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/enrollments/3/progress -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN" -d '{"progress":100}' | node scripts/pick.js id userId status progress
curl -s -w "\nHTTP %{http_code}\n" -X PATCH http://localhost:3000/enrollments/999/progress -H "Content-Type: application/json" -H "Authorization: Bearer $AN" -d '{"progress":50}'
```

```text
{"id":3,"userId":2,"status":"active","progress":80}
HTTP 200
{"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thực hiện thao tác này"}}
HTTP 403
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"progress","message":"Tiến độ phải là số nguyên từ 0 đến 100"}]}}
HTTP 400
{"id":3,"userId":2,"status":"completed","progress":100}
HTTP 200
{"error":{"code":"NOT_FOUND","message":"Không tìm thấy ghi danh"}}
HTTP 404
```

Kiểm tra trong bảng (ghi danh 3 do admin đặt thành 100 nên `completed`; ghi danh 11 do `an` vừa tạo):

```bash
mysql -u root -p rikkei_learn -t -e "SELECT id, user_id, course_id, status, progress FROM enrollments WHERE id IN (3, 11)"
```

```text
+----+---------+-----------+-----------+----------+
| id | user_id | course_id | status    | progress |
+----+---------+-----------+-----------+----------+
|  3 |       2 |         4 | completed |      100 |
| 11 |       2 |         5 | active    |        0 |
+----+---------+-----------+-----------+----------+
```

**Điểm kiểm tra Lab 5:**
- [ ] Đăng ký trả 201, `role` là `student` dù gửi `admin`, không có `passwordHash`; hàng trong `users` có chuỗi băm 60 ký tự bắt đầu `$2a$10$`.
- [ ] Sai mật khẩu và email lạ cùng 401 `Email hoặc mật khẩu không đúng`.
- [ ] Payload token: `sub` là chuỗi `"2"`, `role` là `student`, hạn 3600 giây.
- [ ] `POST /courses`: không token 401, học viên 403, admin 201; body rỗng: học viên 403, admin 400.
- [ ] `an` ghi danh khóa 5 được `id` 11, lần hai 409; admin gọi `enroll` bị 403.
- [ ] `binh` sửa ghi danh 3 của `an` bị 403; `an` sửa được; tiến độ 150 bị 400; ghi danh 999 bị 404.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| Chủ ghi danh cũng bị 403 | `req.user.id` là chuỗi `"2"` còn `userId` là số 2 | `Number(payload.sub)` trong `authenticate` |
| Mật khẩu sai vẫn đăng nhập được | quên `await` trước `bcrypt.compare` | thêm `await` |
| Phản hồi có `passwordHash` | trả nguyên hàng từ repository | luôn đi qua `toPublicUser` |
| Học viên gửi `{}` nhận 400 thay vì 403 | `validate` đứng trước `authorize` | đúng thứ tự `authenticate`, `authorize`, `validate`, controller |
| Mọi yêu cầu có token đều 401 | `JWT_SECRET` đổi sau khi cấp token, hoặc token hết hạn | đăng nhập lại để lấy token mới |

---

## Lab 6 - Thống kê, lớp bảo vệ và kiểm thử (15 phút)

**Áp dụng:** Lesson 07 (và Lesson 03 cho truy vấn thống kê)

**Mục tiêu:** làm `GET /stats` bằng `LEFT JOIN`/`GROUP BY`, thêm `helmet`, CORS cho `http://localhost:5173`, `morgan` chỉ khi không chạy test và giới hạn đăng nhập bằng `express-rate-limit`; viết ba test Vitest và Supertest.

**Các bước thực hiện:**

**Bước 1. `GET /stats`.** Chạy `npm run db:setup` để về dữ liệu gốc, rồi tạo các tệp và ghi đè `src/app.js`:

```bash
npm run db:setup
```

```text

> rikkei-node-exercise@1.0.0 db:setup
> node scripts/db-setup.js

Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_learn.
```

Tệp `src/repositories/stats.repository.js`:

```javascript
const pool = require("../db/pool");

// Mỗi khóa học một dòng: số học viên đang học hoặc đã hoàn thành (không tính dropped) và tiến độ trung bình.
// LEFT JOIN giữ cả khóa chưa có học viên; điều kiện trạng thái nằm trong ON để các khóa đó không bị loại.
async function perCourse() {
  const [rows] = await pool.execute(
    "SELECT c.id AS courseId, c.title, COUNT(e.id) AS studentCount, ROUND(AVG(e.progress), 1) AS avgProgress " +
      "FROM courses c " +
      "LEFT JOIN enrollments e ON e.course_id = c.id AND e.status IN ('active', 'completed') " +
      "GROUP BY c.id, c.title " +
      "ORDER BY c.id"
  );
  // AVG của tập rỗng là NULL; API trả 0 cho khóa chưa có học viên.
  return rows.map((row) => ({ ...row, avgProgress: row.avgProgress === null ? 0 : row.avgProgress }));
}

// Các khóa học đông học viên nhất; đồng hạng thì tiến độ trung bình cao hơn đứng trước, rồi theo id.
// LIMIT dùng pool.query vì pool.execute đòi số nguyên đúng kiểu.
async function topCourses(limit) {
  const [rows] = await pool.query(
    "SELECT c.id AS courseId, c.title, COUNT(e.id) AS studentCount " +
      "FROM courses c " +
      "JOIN enrollments e ON e.course_id = c.id " +
      "WHERE e.status IN ('active', 'completed') " +
      "GROUP BY c.id, c.title " +
      "ORDER BY studentCount DESC, AVG(e.progress) DESC, c.id " +
      "LIMIT ?",
    [limit]
  );
  return rows;
}

module.exports = { perCourse, topCourses };
```

Tệp `src/schemas/stats.schema.js`:

```javascript
const { z } = require("zod");

const TOP_MESSAGE = "top phải từ 1 đến 10";

// Query của GET /stats: top là số khóa học trong bảng xếp hạng (mặc định 3).
const statsQuerySchema = z.object({
  top: z.coerce
    .number({ invalid_type_error: TOP_MESSAGE })
    .int(TOP_MESSAGE)
    .min(1, TOP_MESSAGE)
    .max(10, TOP_MESSAGE)
    .default(3),
});

module.exports = { statsQuerySchema };
```

Tệp `src/controllers/stats.controller.js`:

```javascript
const statsRepository = require("../repositories/stats.repository");

// GET /stats: gom số liệu từ hai truy vấn thành một phản hồi.
async function getStats(req, res) {
  const perCourse = await statsRepository.perCourse();
  const topCourses = await statsRepository.topCourses(req.query.top);
  res.json({ totals: { courses: perCourse.length }, perCourse, topCourses });
}

module.exports = { getStats };
```

Tệp `src/routes/stats.routes.js`:

```javascript
const express = require("express");
const controller = require("../controllers/stats.controller");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const asyncHandler = require("../middlewares/asyncHandler");
const { statsQuerySchema } = require("../schemas/stats.schema");

const router = express.Router();

// Thống kê chỉ dành cho admin. Thứ tự: authenticate, authorize, validate, controller.
router.get("/", authenticate, authorize("admin"), validate(statsQuerySchema, "query"), asyncHandler(controller.getStats));

module.exports = router;
```

Tệp `src/app.js` (thêm `/stats`):

```javascript
const express = require("express");
const authRouter = require("./routes/auth.routes");
const meRouter = require("./routes/me.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const coursesRouter = require("./routes/courses.routes");
const statsRouter = require("./routes/stats.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/courses", coursesRouter);
app.use("/stats", statsRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Sau khi lưu, terminal in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Gọi bằng token admin (biến `$ADMIN`, `$AN` đã lấy ở Lab 5; còn hạn 1 giờ, hết hạn thì lấy lại):

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/stats -H "Authorization: Bearer $ADMIN"
```

Kết quả mong đợi (khóa 2 có 3 học viên, tiến độ trung bình 91.7; khóa 4 chỉ tính ghi danh không `dropped`):

```text
{"totals":{"courses":6},"perCourse":[{"courseId":1,"title":"HTML và CSS cơ bản","studentCount":1,"avgProgress":100},{"courseId":2,"title":"JavaScript cơ bản","studentCount":3,"avgProgress":91.7},{"courseId":3,"title":"JavaScript nâng cao","studentCount":1,"avgProgress":40},{"courseId":4,"title":"ReactJS","studentCount":1,"avgProgress":60},{"courseId":5,"title":"NodeJS và Express","studentCount":1,"avgProgress":25},{"courseId":6,"title":"Cơ sở dữ liệu MySQL","studentCount":2,"avgProgress":75}],"topCourses":[{"courseId":2,"title":"JavaScript cơ bản","studentCount":3},{"courseId":6,"title":"Cơ sở dữ liệu MySQL","studentCount":2},{"courseId":1,"title":"HTML và CSS cơ bản","studentCount":1}]}
HTTP 200
```

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/stats -H "Authorization: Bearer $AN"
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/stats?top=2" -H "Authorization: Bearer $ADMIN" | node scripts/pick.js topCourses
curl -s -w "\nHTTP %{http_code}\n" "http://localhost:3000/stats?top=0" -H "Authorization: Bearer $ADMIN"
```

```text
{"error":{"code":"FORBIDDEN","message":"Bạn không có quyền thực hiện thao tác này"}}
HTTP 403
{"topCourses":[{"courseId":2,"title":"JavaScript cơ bản","studentCount":3},{"courseId":6,"title":"Cơ sở dữ liệu MySQL","studentCount":2}]}
HTTP 200
{"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ","details":[{"field":"top","message":"top phải từ 1 đến 10"}]}}
HTTP 400
```

**Bước 2. `helmet` và CORS.** Trước khi thêm `helmet`, xem tiêu đề hiện tại:

```bash
curl -s -D - -o /dev/null http://localhost:3000/health | grep -i -E "^(HTTP|x-powered|x-content-type|x-frame|strict-transport)"
```

```text
HTTP/1.1 200 OK
X-Powered-By: Express
```

Tạo `src/middlewares/loginLimiter.js` rồi ghi đè `src/app.js` bằng bản có `helmet`, `cors`, `morgan` và giới hạn đăng nhập:

Tệp `src/middlewares/loginLimiter.js`:

```javascript
const rateLimit = require("express-rate-limit");
const httpError = require("../errors/httpError");

// Giới hạn đăng nhập theo IP: tối đa 5 yêu cầu trong 15 phút; vượt thì trả lỗi 429 cùng định dạng lỗi của cả API.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(httpError(429, "RATE_LIMITED", "Quá nhiều yêu cầu, hãy thử lại sau")),
});

module.exports = loginLimiter;
```

Tệp `src/app.js`:

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config/env");
const loginLimiter = require("./middlewares/loginLimiter");
const authRouter = require("./routes/auth.routes");
const meRouter = require("./routes/me.routes");
const enrollmentsRouter = require("./routes/enrollments.routes");
const coursesRouter = require("./routes/courses.routes");
const statsRouter = require("./routes/stats.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Lớp bảo vệ đứng trước mọi router: tiêu đề bảo mật, CORS (chỉ frontend ở cổng 5173), nhật ký yêu cầu.
app.use(helmet());
app.use(cors({ origin: ["http://localhost:5173"] }));
// Khi chạy test, morgan tắt để không làm rối kết quả.
if (config.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// Đọc body JSON phải đứng trước router để req.body có dữ liệu.
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Giới hạn tần suất chỉ áp dụng cho đăng nhập, đặt trước authRouter.
app.use("/auth/login", loginLimiter);
app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/enrollments", enrollmentsRouter);
app.use("/courses", coursesRouter);
app.use("/stats", statsRouter);

// Hai middleware cuối cùng: đường dẫn không tồn tại, rồi xử lý lỗi tập trung.
app.use(notFound);
app.use(errorHandler);

// Chỉ xuất app; src/server.js mới mở cổng.
module.exports = app;
```

Sau khi lưu, terminal in:

```text
[nodemon] restarting due to changes...
[nodemon] starting `node src/server.js`
Máy chủ chạy ở http://localhost:3000
```

Xem lại tiêu đề: `X-Powered-By` biến mất, xuất hiện các tiêu đề của `helmet`:

```bash
curl -s -D - -o /dev/null http://localhost:3000/health | grep -i -E "^(HTTP|x-powered|x-content-type|x-frame|strict-transport)"
```

```text
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

Thử CORS với origin của frontend, origin lạ và yêu cầu preflight của trình duyệt (`OPTIONS`):

```bash
curl -s -D - -o /dev/null -H "Origin: http://localhost:5173" http://localhost:3000/courses/1 | grep -i -E "^(HTTP|access-control|vary)"
curl -s -D - -o /dev/null -H "Origin: http://evil.example" http://localhost:3000/courses/1 | grep -i -E "^(HTTP|access-control|vary)"
curl -s -D - -o /dev/null -X OPTIONS http://localhost:3000/courses -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization" | grep -i -E "^(HTTP|access-control|vary)"
```

```text
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
HTTP/1.1 200 OK
Vary: Origin
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type,authorization
```

Origin lạ vẫn nhận phản hồi 200 nhưng không có `Access-Control-Allow-Origin`, nên trình duyệt sẽ chặn việc đọc kết quả. Bây giờ `morgan` ghi mỗi yêu cầu vào terminal chạy `npm run dev`. Sau hai yêu cầu sau:

```bash
curl -s http://localhost:3000/health
curl -s -o /dev/null http://localhost:3000/stats
```

terminal in thêm hai dòng (thời gian xử lý khác nhau trên máy bạn; trên màn hình có màu theo mã trạng thái):

```text
GET /health 200 0.394 ms - 15
GET /stats 401 1.980 ms - 80
```

**Bước 3. Giới hạn đăng nhập.** Bộ đếm nằm trong bộ nhớ của tiến trình, nên bạn lưu lại `src/app.js` (thêm một dòng trống rồi lưu) để `nodemon` khởi động lại và đặt bộ đếm về 0. Sau đó gửi 6 lần đăng nhập sai mật khẩu:

```bash
for i in 1 2 3 4 5 6; do curl -s -o /dev/null -w "#$i: HTTP %{http_code}\n" -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"an@rikkei.edu","password":"SaiMatKhau1"}'; done
```

Kết quả mong đợi (năm lần 401, lần thứ sáu bị chặn):

```text
#1: HTTP 401
#2: HTTP 401
#3: HTTP 401
#4: HTTP 401
#5: HTTP 401
#6: HTTP 429
```

Xem toàn bộ phản hồi 429 (tiêu đề `RateLimit-*` và `Retry-After` tính bằng giây còn lại của cửa sổ 15 phút, nên giá trị thấp hơn 900 một chút), rồi kiểm tra route khác không bị ảnh hưởng:

```bash
curl -s -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"an@rikkei.edu","password":"SaiMatKhau1"}'
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/health
```

```text
HTTP/1.1 429 Too Many Requests
Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin
RateLimit-Policy: 5;w=900
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 899
Retry-After: 899
Content-Type: application/json; charset=utf-8
Content-Length: 91
ETag: W/"5b-xe9z2OB7xL1v5mmwa/xNIf07PBc"
Date: Mon, 26 Oct 2026 09:14:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":{"code":"RATE_LIMITED","message":"Quá nhiều yêu cầu, hãy thử lại sau"}}
{"status":"ok"}
HTTP 200
```

Trong 15 phút tới bạn không đăng nhập được từ máy này; lưu lại một tệp trong `src/` để nodemon khởi động lại là bộ đếm về 0.

**Bước 4. Kiểm thử bằng Vitest và Supertest.** Khuôn có sẵn `vitest.config.js`, `tests/setup.js` (đặt `NODE_ENV=test` và dùng cơ sở dữ liệu `DB_NAME_TEST`) và `tests/helpers/db.js` (`resetDatabase()` từ chối chạy nếu tên không kết thúc `_test`). Tạo một tệp test nhỏ; token được ký trực tiếp bằng `jwt.sign` nên không dùng lượt đăng nhập nào:

Tệp `tests/smoke.test.js`:

```javascript
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const pool = require("../src/db/pool");
const config = require("../src/config/env");
const { resetDatabase } = require("./helpers/db");

// Ký token trực tiếp cho test: không cần gọi /auth/login (đăng nhập bị giới hạn 5 lần).
function tokenFor(id, role) {
  return jwt.sign({ sub: String(id), role }, config.jwtSecret, { expiresIn: "1h" });
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool.end();
});

describe("Rikkei Learn API", () => {
  it("GET /health trả 200 và { status: 'ok' }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("GET /stats: không token 401, học viên 403, admin 200 với 6 khóa học", async () => {
    const anonymous = await request(app).get("/stats");
    expect(anonymous.status).toBe(401);
    const student = await request(app).get("/stats").set("Authorization", "Bearer " + tokenFor(2, "student"));
    expect(student.status).toBe(403);
    const admin = await request(app).get("/stats").set("Authorization", "Bearer " + tokenFor(1, "admin"));
    expect(admin.status).toBe(200);
    expect(admin.body.perCourse).toHaveLength(6);
  });

  it("học viên ghi danh khóa 5 thì /stats của khóa đó tăng thêm 1", async () => {
    const admin = "Bearer " + tokenFor(1, "admin");
    const before = await request(app).get("/stats").set("Authorization", admin);
    const enroll = await request(app).post("/courses/5/enroll").set("Authorization", "Bearer " + tokenFor(2, "student"));
    expect(enroll.status).toBe(201);
    const after = await request(app).get("/stats").set("Authorization", admin);
    expect(after.body.perCourse[4].studentCount).toBe(before.body.perCourse[4].studentCount + 1);
  });
});
```

```bash
npm test
```

Kết quả mong đợi (Vitest in dấu tích ở đầu mỗi dòng đạt, tài liệu viết là PASS; thời gian `Duration` khác nhau trên máy bạn):

```text

> rikkei-node-exercise@1.0.0 test
> vitest run


 RUN  v3.1.4 <thư mục dự án>

 PASS tests/smoke.test.js (3 tests) 1810ms
   PASS Rikkei Learn API > GET /health trả 200 và { status: 'ok' }  645ms
   PASS Rikkei Learn API > GET /stats: không token 401, học viên 403, admin 200 với 6 khóa học  470ms
   PASS Rikkei Learn API > học viên ghi danh khóa 5 thì /stats của khóa đó tăng thêm 1  690ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  16:14:15
   Duration  3.30s (transform 57ms, setup 29ms, collect 750ms, tests 1.81s, environment 0ms, prepare 246ms)
```

Chú ý: trong `npm test` không có dòng nhật ký của `morgan`, vì `NODE_ENV` là `test`.

**Điểm kiểm tra Lab 6:**
- [ ] `GET /stats` bằng token admin trả 6 khóa trong `perCourse`; học viên 403; `top=0` trả 400 `top phải từ 1 đến 10`.
- [ ] `X-Powered-By` biến mất sau khi thêm `helmet`; có `X-Content-Type-Options: nosniff` và `X-Frame-Options: SAMEORIGIN`.
- [ ] Origin `http://localhost:5173` nhận `Access-Control-Allow-Origin`; origin lạ thì không; preflight trả 204 với danh sách method.
- [ ] 5 lần đăng nhập sai trả 401, lần thứ 6 trả 429 `RATE_LIMITED`; `GET /health` vẫn 200.
- [ ] `npm test` báo 3 test đạt.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
| :-- | :-- | :-- |
| Origin của frontend vẫn không có header CORS | `cors` đặt sau router | gắn `cors` trước mọi router |
| Mọi route đều 429 sau vài yêu cầu | gắn `loginLimiter` bằng `app.use(loginLimiter)` | `app.use("/auth/login", loginLimiter)` |
| Test báo `Từ chối xóa dữ liệu: tên cơ sở dữ liệu ... không kết thúc bằng _test` | `DB_NAME_TEST` trong `.env` không kết thúc bằng `_test` | đặt `DB_NAME_TEST=rikkei_learn_test` |
| Test của bạn tự nhiên báo 429 | đăng nhập quá 5 lần trong một tệp test | ký token bằng `jwt.sign` hoặc `tokenFor` thay vì gọi `/auth/login` |
| Log của `morgan` chen vào kết quả test | `morgan` luôn bật | bọc trong `if (config.nodeEnv !== "test")` |

---

## Tổng kết (5 phút)

Giảng viên gọi vài sinh viên mở terminal và hỏi vấn đáp ngắn: vì sao `/search` phải đứng trước `/:id`; vì sao `app.js` chỉ xuất app còn `server.js` mới `listen`; `LEFT JOIN` với điều kiện ở `ON` khác ở `WHERE` thế nào, nêu số hàng 6 và 5 của Lab 2; vì sao dấu `?` chặn được SQL injection mà tên cột `ORDER BY` thì không; `rollback` trong `catch` và `release` trong `finally` giải quyết việc gì; vì sao `LIMIT ?` dùng `pool.query`; 401 khác 403 ở đâu và vì sao `sub` của JWT là chuỗi; vì sao đăng nhập sai dùng một thông báo chung; vì sao `cors` phải đứng trước router. Mỗi sinh viên chọn một yêu cầu bất kỳ của Lab 6 và nói ba điều: method, mã trạng thái, middleware nào đã trả về mã đó.

---

## Rubric chấm lab (10 điểm)

| Tiêu chí | Điểm |
| :--- | :---: |
| Lab 1 - dựng dự án, `app.js`/`server.js`, `httpError`, `errorHandler`, thứ tự route, `express.json()`, đọc đúng lỗi 500 và 400 | 1 |
| Lab 2 - nạp cơ sở dữ liệu, `JOIN`, `LEFT JOIN` với `ON` so với `WHERE`, `GROUP BY`, `HAVING`, `src/sql/queries.js` | 1.5 |
| Lab 3 - truy vấn tham số hóa, giải thích SQL injection, `enrollStudent` bằng giao dịch (`rollback`, `release` trong `finally`), bốn ca lỗi | 2 |
| Lab 4 - `zod` và `validate`, phân trang và `meta`, `errorHandler` cho lỗi MySQL, `DELETE` 409 và cascade | 1.5 |
| Lab 5 - `bcryptjs`, JWT, `authenticate`, `authorize`, thứ tự middleware, quyền sở hữu, không lộ `passwordHash` | 2 |
| Lab 6 - `/stats`, `helmet`, CORS, giới hạn đăng nhập, `morgan` tắt khi test, chạy được `npm test` | 1 |
| Chất lượng mã: tên tiếng Anh, chú thích tiếng Việt, SQL luôn tham số hóa, không `class`/`this`/`var`, không commit `.env` | 1 |
| **Tổng** | **10** |

---

## Tự học thêm (không kiểm tra, không đưa vào lab)

- Chủ đề ngoài phạm vi của môn này: ORM (Prisma, Sequelize, TypeORM), Knex, TypeScript, ES module cho dự án Node, GraphQL, WebSocket, upload tệp, Redis, hàng đợi, Docker, triển khai lên cloud, refresh token, OAuth, cookie phiên, migration tool, kiểm thử tích hợp trong CI.
- Tài liệu đọc thêm: [Express](https://expressjs.com), [mysql2](https://sidorares.github.io/node-mysql2/docs), [zod](https://zod.dev), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [Helmet](https://helmetjs.github.io), [Vitest](https://vitest.dev).

---

## Phụ lục - Bảng tra tệp của dự án

| Tệp | Lab | Vai trò |
| :-- | :-: | :-- |
| `src/errors/httpError.js`, `src/middlewares/errorHandler.js`, `notFound.js`, `asyncHandler.js`, `src/app.js`, `src/server.js` | 1 | Nền tảng Express |
| `src/data/courses.js`, `src/routes/courses.routes.js` (bản trong bộ nhớ) | 1 | API khóa học tạm |
| `src/sql/queries.js`, `scripts/run-query.js` | 2 | Truy vấn SQL |
| `src/repositories/courses.repository.js`, `enrollments.repository.js`, `scripts/try-*.js` | 3 | Lớp truy cập dữ liệu, giao dịch |
| `src/schemas/course.schema.js`, `src/middlewares/validate.js`, `lessons.repository.js`, `courses.controller.js` | 4 | `zod`, phân tầng |
| `users.repository.js`, `auth.schema.js`, `auth.controller.js`, `authenticate.js`, `authorize.js`, `auth.routes.js` | 5 | Xác thực, phân quyền |
| `enrollment.schema.js`, `enrollments.controller.js`, `me.routes.js`, `enrollments.routes.js`, `scripts/get-token.js`, `scripts/pick.js` | 5 | Ghi danh, quyền sở hữu, công cụ thử |
| `stats.repository.js`, `stats.schema.js`, `stats.controller.js`, `stats.routes.js`, `loginLimiter.js`, `tests/smoke.test.js` | 6 | Thống kê, bảo vệ, kiểm thử |

Các chuỗi kết quả trong tài liệu này (dòng log máy chủ, thân JSON, mã trạng thái, hàng trong bảng MySQL, đầu ra Vitest) được ghi lại từ một lần chạy thật của chính mã trong từng bước, với Node.js 22, MySQL 8.0.45, Express 4.21.2, nodemon 3.1.9 và Vitest 3.1.4. Cơ sở dữ liệu dùng khi ghi lại có tên khác với tên trong tài liệu và đã được thay bằng `rikkei_learn`, `rikkei_learn_test`; cổng máy chủ là 3000.
