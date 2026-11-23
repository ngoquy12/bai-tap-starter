# Session 04 - Thực hành: Hoàn thiện lớp dữ liệu MySQL cho Rikkei Shop

**Thời lượng:** tầng Bắt buộc 90 phút (Lab 1 đến Lab 5 cùng 5 phút tổng kết), sau đó 30 phút bài tổng hợp tại lớp; tầng Nâng cao (Lab 6, Lab 7) làm thêm ngoài giờ.
**Điều kiện tiên quyết:** đã học Session 03 (Lesson 01 đến Lesson 07) và đã chạy được dự án Node của Session 01-02 (`mysql2`, Vitest).
**Công cụ:** Visual Studio Code, Node.js 18 trở lên, MySQL 8.0 đang chạy trên máy, Git Bash (hoặc PowerShell), dự án `starter/` đi kèm tài liệu này.
**Nguyên tắc bắt buộc:** chỉ dùng kiến thức của Session 03 (khóa chính, khóa ngoại, `ON DELETE`, `JOIN`, `GROUP BY`, `HAVING`, `GROUP_CONCAT`, subquery, `EXISTS`, CTE, window function, `CREATE VIEW`, index, `EXPLAIN`, `FULLTEXT`, keyset, transaction, `FOR UPDATE`, procedure, `SIGNAL`, handler, trigger) và cách chạy SQL từ Node của Session 01-02. Không dùng ORM, query builder hay công cụ migration.
**Mức AI:** Lab 1 đến Lab 4 và Lab 6, Lab 7 là mức AI-0: tự viết SQL, không nhờ trợ lý AI sinh mã. Lab 5 là mức AI-2: bạn nhận mã do trợ lý AI sinh, kiểm chứng bằng test, sửa và ghi nhật ký.

**Kịch bản xuyên suốt:** Chị Lan (Product Owner) cần lớp dữ liệu MySQL hoàn chỉnh cho Rikkei Shop trước khi nhóm API gắn vào: khách lưu sản phẩm yêu thích, trang cửa hàng có lọc nhãn, tìm theo tên và phân trang, trang quản trị có báo cáo doanh thu và top bán chạy, trang danh mục cuộn sâu vẫn nhanh, và đặt hàng không bao giờ bán quá tồn kho. Anh Hùng (Tech Lead) chốt cách làm: mọi câu SQL nằm trong `src/sql/`, mỗi chặng có bộ test Vitest chạy trên cơ sở dữ liệu thử `rikkei_shop_sql_test`, và đoạn procedure đặt hàng mà trợ lý AI vừa sinh phải qua phản biện trước khi dùng.

**Bảng thời lượng:**

| Tầng | Phần | Phút |
|---|---|---|
| Bắt buộc | Lab 1 - Bảng yêu thích | 15 |
| Bắt buộc | Lab 2 - Trang cửa hàng | 20 |
| Bắt buộc | Lab 3 - Báo cáo quản trị | 15 |
| Bắt buộc | Lab 4 - Index và trang keyset | 15 |
| Bắt buộc | Lab 5 - Phản biện procedure đặt hàng do AI sinh | 20 |
| Bắt buộc | Tổng kết | 5 |
| Bắt buộc | Cộng phần lab | 90 |
| Bắt buộc | Bài tổng hợp tại lớp (thư mục `Bai tong hop tren lop/`) | 30 |
| Nâng cao (tùy chọn) | Lab 6 - Nhật ký kho bằng trigger | 20 |
| Nâng cao (tùy chọn) | Lab 7 - Tìm kiếm FULLTEXT | 15 |

Hoàn thành tầng Bắt buộc (mọi test của Lab 1 đến Lab 5 xanh, nhật ký Lab 5 đủ) cùng bài tổng hợp tại lớp là đạt buổi học. Lab 6 và Lab 7 không tính vào điều kiện đạt.

| Lab | Phần của mô-đun | Bài đọc liên quan |
|---|---|---|
| 1 | Bảng `wishlists` và ràng buộc khóa | Lesson 01 |
| 2 | Truy vấn trang cửa hàng: nhãn, lượt yêu thích, lọc, sắp xếp, phân trang kèm tổng | Lesson 02, Lesson 03, Lesson 04 |
| 3 | Báo cáo doanh thu theo danh mục, top 2 bán chạy, view `v_top_sellers` | Lesson 03, Lesson 04 |
| 4 | Index ghép, `EXPLAIN`, trang kế tiếp kiểu keyset | Lesson 05 |
| 5 | Phản biện và sửa procedure `sp_place_order` | Lesson 06, Lesson 07 |
| 6 (nâng cao) | Bảng `inventory_logs` và trigger nhật ký kho | Lesson 07 |
| 7 (nâng cao) | Index `FULLTEXT` ngram và truy vấn tìm kiếm | Lesson 05 |

**Cách tổ chức tệp:**

1. Chép thư mục `starter/` thành thư mục làm bài của bạn (ví dụ `rikkei-shop-sql`). Dự án đã ghim sẵn phiên bản gói như các buổi trước; không chạy `npm init`, không cài thêm gói.
2. `db/schema.sql` và `db/seed.sql` chép nguyên từ `_shared/db-sql` của môn; không sửa. Dữ liệu bổ sung của Lab 3 và Lab 4 nằm trong `tests/fixtures/`.
3. Bạn chỉ viết vào các tệp trong `src/sql/` (mỗi tệp có sẵn chú thích đầu vào và đầu ra) và `docs/nhat_ky_ai.md`. Không sửa `tests/`, `scripts/`, `src/db/`, `src/config/`.
4. Công cụ `scripts/sql.js` chạy SQL trên cơ sở dữ liệu `rikkei_shop_sql` của bạn và in kết quả: `file` chạy một tệp `.sql`, `query` chạy một truy vấn xuất từ `src/sql/<tệp>.js` kèm tham số, `explain` in kế hoạch đọc của truy vấn đó, `exec` chạy một câu SQL gõ trực tiếp. Giá trị `NULL` được in là `NULL`.
5. Lệnh trong tài liệu viết cho Git Bash. Trong PowerShell gõ y hệt; nếu chữ có dấu hiện sai, chạy `chcp 65001` một lần trong cửa sổ đó. PowerShell bỏ mất tham số chuỗi rỗng `""`, nên mọi ví dụ trong tài liệu đều dùng từ khóa có ít nhất một ký tự.
6. "Kết quả mong đợi" là đầu ra thật của đúng lệnh trong bước, chạy trên MySQL 8.0.45 với cơ sở dữ liệu `rikkei_shop_sql`. Riêng đầu ra của Vitest, tài liệu chỉ chép hai dòng tóm tắt `Test Files` và `Tests` (khi có test đỏ thì chép thêm dòng `FAIL` và dòng `AssertionError` của từng test đỏ); danh sách từng test và các dòng thời gian (`Duration`, `Start at`) vẫn hiện trên máy bạn và khác nhau giữa các máy.

**Quy ước mã (Anh Hùng yêu cầu):**

- SQL: từ khóa viết hoa, tên bảng và cột `snake_case` tiếng Anh, thụt lề 4 khoảng trắng, bí danh bảng một chữ (`p` products, `c` categories, `t` tags, `pt` product_tags, `o` orders, `oi` order_items, `u` users, `w` wishlists).
- Cột kết quả trả cho API đặt bí danh `camelCase` bằng `AS`, đúng tên và thứ tự ghi trong chú thích của tệp.
- Mọi `SELECT` trả nhiều hàng có `ORDER BY` kết thúc bằng một cột không trùng (thường là `id`).
- Tham số luôn là dấu `?`; không nối chuỗi giá trị vào câu SQL. `LIMIT ?` chạy bằng `query` (không dùng `execute`), như quy ước của môn.
- JavaScript: CommonJS, chuỗi SQL viết trong dấu backtick, thụt lề 2 khoảng trắng.

**Dữ liệu dùng chung (từ `db/seed.sql`):**

| Bảng | Nội dung cần nhớ |
|---|---|
| `categories` | 1 Điện tử, 2 Thời trang, 3 Sách |
| `products` | 1 Tai nghe Bluetooth 450000 (kho 25), 2 Bàn phím cơ 890000 (12), 3 Áo thun 199000 (50), 4 Giày chạy bộ 1250000 (0), 5 Sách Lập trình 160000 (30), 6 Chuột không dây 320000 (40), 7 Quần jeans 590000 (18), 8 Sách Cơ sở dữ liệu 210000 (22) |
| `users` | 1 Quản trị Rikkei, 2 Nguyễn Thị Lan, 3 Trần Văn Hùng |
| `tags`, `product_tags` | 1 Bán chạy (sản phẩm 1, 2), 2 Giảm giá (1, 3, 6), 3 Hàng mới (6, 8) |
| `orders`, `order_items` | Đơn 1 của Lan (2 Tai nghe, 1 Áo thun), đơn 2 của Lan (1 Sách Lập trình), đơn 3 của Hùng (1 Bàn phím cơ, 2 Chuột không dây) |

**Quy tắc nghiệp vụ dùng chung:**

| Mã | Quy tắc |
|---|---|
| R1 | Một khách chỉ thêm một sản phẩm vào danh sách yêu thích một lần; xóa khách hoặc xóa sản phẩm thì lượt yêu thích liên quan mất theo. |
| R2 | Thẻ sản phẩm hiện đủ mọi nhãn (nối bằng `, ` theo `id` nhãn) và số lượt yêu thích; lọc theo một nhãn không được làm mất các nhãn còn lại. |
| R3 | Danh sách cửa hàng xếp giá giảm dần, cùng giá thì `id` tăng dần; mỗi trang kèm tổng số sản phẩm khớp bộ lọc. |
| R4 | Báo cáo quản trị giữ cả danh mục chưa bán được gì; top bán chạy giữ đồng hạng. |
| R5 | Trang danh mục xếp giá tăng dần, cùng giá thì `id` tăng dần; trang sau đọc tiếp sau hàng cuối của trang trước. |
| R6 | Đặt hàng: số lượng từ 1 trở lên, ghi giá bán tại thời điểm đặt, không bán quá tồn kho kể cả khi nhiều người đặt cùng lúc, lỗi ở bước nào cũng không để lại đơn dở. |

---

## Lab 1 - Bảng yêu thích wishlists (15 phút)

**Tầng:** Bắt buộc
**Mức AI:** AI-0

**Áp dụng:** Lesson 01

**Mục tiêu:** tạo bảng nối `wishlists` có khóa ghép và hai khóa ngoại `CASCADE`, nạp 5 lượt yêu thích mẫu và đọc đúng mã lỗi MySQL khi dữ liệu sai.

**Các bước thực hiện:**

**Bước 1. Dựng dự án và cơ sở dữ liệu.** Trong thư mục làm bài, tạo `.env`, cài gói và nạp dữ liệu mẫu; mở `.env` sửa `DB_USER`, `DB_PASSWORD`, `DB_PORT` cho khớp MySQL của bạn, giữ `DB_NAME=rikkei_shop_sql`.

```bash
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
npm install
npm run db:setup
node scripts/sql.js exec "SELECT COUNT(*) AS products, SUM(stock) AS totalStock FROM products"
```

Kết quả mong đợi (dòng cuối của `npm run db:setup` và kết quả câu đếm):

```text
Đã nạp schema.sql và seed.sql vào cơ sở dữ liệu rikkei_shop_sql.
products | totalStock
8 | 197
```

**Bước 2. Viết bảng wishlists.** Mở `src/sql/lab1_wishlists.sql`, viết lệnh `CREATE TABLE wishlists` và lệnh nạp dữ liệu mẫu theo hai bảng dưới, rồi chạy tệp và đọc lại bảng.

| Cột hoặc ràng buộc | Yêu cầu |
|---|---|
| `user_id`, `product_id` | `INT UNSIGNED NOT NULL` |
| Khóa chính | khóa ghép trên cặp (`user_id`, `product_id`), theo quy tắc R1 |
| `fk_wishlists_user` | `user_id` tham chiếu `users (id)`, xóa khách thì xóa theo |
| `fk_wishlists_product` | `product_id` tham chiếu `products (id)`, xóa sản phẩm thì xóa theo |

| Khách | Sản phẩm yêu thích |
|---|---|
| Lan (`user_id` 2) | 1 Tai nghe Bluetooth, 6 Chuột không dây |
| Hùng (`user_id` 3) | 1 Tai nghe Bluetooth, 2 Bàn phím cơ, 8 Sách Cơ sở dữ liệu |

```bash
node scripts/sql.js file src/sql/lab1_wishlists.sql
node scripts/sql.js exec "SELECT user_id, product_id FROM wishlists ORDER BY user_id, product_id"
```

Kết quả mong đợi (ba dòng `Query OK` lần lượt của `DROP TABLE IF EXISTS`, `CREATE TABLE`, `INSERT`):

```text
Query OK, 0 rows affected
Query OK, 0 rows affected
Query OK, 5 rows affected
user_id | product_id
2 | 1
2 | 6
3 | 1
3 | 2
3 | 8
```

**Bước 3. Thử ba lệnh sai.** Lan bấm "Yêu thích" Tai nghe lần hai, một yêu cầu gửi sản phẩm 99 không tồn tại, và quản trị thử xóa Tai nghe Bluetooth.

```bash
node scripts/sql.js exec "INSERT INTO wishlists (user_id, product_id) VALUES (2, 1)"
node scripts/sql.js exec "INSERT INTO wishlists (user_id, product_id) VALUES (2, 99)"
node scripts/sql.js exec "DELETE FROM products WHERE id = 1"
```

Kết quả mong đợi:

```text
ERROR 1062 (23000): Duplicate entry '2-1' for key 'wishlists.PRIMARY'
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`rikkei_shop_sql`.`wishlists`, CONSTRAINT `fk_wishlists_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE)
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`rikkei_shop_sql`.`order_items`, CONSTRAINT `fk_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT)
```

- Lệnh xóa bị chặn bởi `order_items` (`RESTRICT`, Lesson 01 mục 2.1), không phải bởi `wishlists`: Tai nghe đã nằm trong đơn 1. `CASCADE` của `wishlists` chỉ có tác dụng với sản phẩm chưa ai đặt, như sản phẩm 8.

**Bước 4. Chạy test của Lab 1.**

```bash
npx vitest run tests/lab1.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

**Điểm kiểm tra Lab 1:**

- [ ] Với cặp (2, 1) đã có, lệnh `INSERT` lần hai trả `ERROR 1062 (23000): Duplicate entry '2-1' for key 'wishlists.PRIMARY'`.
- [ ] Với `product_id` 99, lệnh `INSERT` trả lỗi `1452` nêu tên `fk_wishlists_product`.
- [ ] Sau khi test xóa Lan (`user_id` 2), `wishlists` còn 3 hàng của Hùng và `orders` vẫn còn 3 đơn.
- [ ] `npx vitest run tests/lab1.test.js` in `Tests  8 passed (8)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Test `khóa chính là khóa ghép` đỏ, lệnh `INSERT (2, 1)` lần hai báo `Query OK` | Đặt khóa chính là cột `id` tự tăng nên không gì chặn cặp trùng (Lesson 01, Lỗi 2) | Khóa chính là cặp (`user_id`, `product_id`) |
| Test `xóa sản phẩm 8` đỏ với `ERROR 1451` | Khóa ngoại sản phẩm để mặc định hoặc `RESTRICT` | Ghi rõ `ON DELETE CASCADE` cho cả hai khóa ngoại |
| `ERROR 1050 (42S01): Table 'wishlists' already exists` khi chạy lại tệp | Xóa mất dòng `DROP TABLE IF EXISTS wishlists;` ở đầu tệp | Giữ dòng đó để chạy lại tệp bao nhiêu lần cũng được |

---

## Lab 2 - Trang cửa hàng: nhãn, lượt yêu thích, lọc và phân trang (20 phút)

**Tầng:** Bắt buộc
**Mức AI:** AI-0

**Áp dụng:** Lesson 02, Lesson 03, Lesson 04

**Mục tiêu:** viết ba truy vấn trong `src/sql/storefront.js` cho trang cửa hàng: thẻ sản phẩm có nhãn và lượt yêu thích không bị nhân dòng, lọc theo nhãn mà vẫn giữ đủ nhãn, rồi lọc thêm từ khóa, sắp xếp có cột phân xử và phân trang kèm tổng bằng `COUNT(*) OVER ()`.

**Các bước thực hiện:**

**Bước 1. Thẻ sản phẩm (`productCards`).** Mỗi sản phẩm một hàng với 6 cột `id, name, price, categoryName, tags, wishlistCount`. Một sản phẩm có thể vừa có 2 nhãn vừa có 2 lượt yêu thích: ghép thẳng cả hai bảng con thì số hàng nhân lên (Lesson 02 mục 2.3, Lỗi 2). Gộp từng nhánh trước rồi mới ghép (Lesson 03 mục 3.3); `COALESCE` đổi `NULL` của lượt yêu thích thành 0, còn `tags` giữ `NULL` khi sản phẩm chưa có nhãn.

```bash
node scripts/sql.js query storefront productCards
```

Kết quả mong đợi:

```text
id | name | price | categoryName | tags | wishlistCount
1 | Tai nghe Bluetooth | 450000 | Điện tử | Bán chạy, Giảm giá | 2
2 | Bàn phím cơ | 890000 | Điện tử | Bán chạy | 1
3 | Áo thun | 199000 | Thời trang | Giảm giá | 0
4 | Giày chạy bộ | 1250000 | Thời trang | NULL | 0
5 | Sách Lập trình | 160000 | Sách | NULL | 0
6 | Chuột không dây | 320000 | Điện tử | Giảm giá, Hàng mới | 1
7 | Quần jeans | 590000 | Thời trang | NULL | 0
8 | Sách Cơ sở dữ liệu | 210000 | Sách | Hàng mới | 1
```

**Bước 2. Lọc theo nhãn (`productsByTag`).** Tham số `[tagName]`, cùng 6 cột, thứ tự `id` tăng dần. Điều kiện nhãn đặt trong truy vấn con (`IN` hoặc `EXISTS`, Lesson 03 mục 2.2) để cột `tags` vẫn đủ mọi nhãn theo quy tắc R2.

```bash
node scripts/sql.js query storefront productsByTag "Giảm giá"
```

Kết quả mong đợi:

```text
id | name | price | categoryName | tags | wishlistCount
1 | Tai nghe Bluetooth | 450000 | Điện tử | Bán chạy, Giảm giá | 2
3 | Áo thun | 199000 | Thời trang | Giảm giá | 0
6 | Chuột không dây | 320000 | Điện tử | Giảm giá, Hàng mới | 1
```

**Bước 3. Một trang của cửa hàng (`storefrontPage`).** Tham số `[tagName, keyword, limit, offset]`; giữ điều kiện nhãn của Bước 2, thêm điều kiện tên chứa từ khóa, sắp xếp theo quy tắc R3 và thêm cột thứ 7 `total` bằng `COUNT(*) OVER ()` (Lesson 04 mục 3.1). Chạy trang 1, trang 2 và một từ khóa viết thường.

```bash
node scripts/sql.js query storefront storefrontPage "Giảm giá" "t" 2 0
node scripts/sql.js query storefront storefrontPage "Giảm giá" "t" 2 2
node scripts/sql.js query storefront storefrontPage "Giảm giá" "chuột" 10 0
node scripts/sql.js query storefront storefrontPage "Giảm giá" "t" 2 4
```

Kết quả mong đợi:

```text
id | name | price | categoryName | tags | wishlistCount | total
1 | Tai nghe Bluetooth | 450000 | Điện tử | Bán chạy, Giảm giá | 2 | 3
6 | Chuột không dây | 320000 | Điện tử | Giảm giá, Hàng mới | 1 | 3
id | name | price | categoryName | tags | wishlistCount | total
3 | Áo thun | 199000 | Thời trang | Giảm giá | 0 | 3
id | name | price | categoryName | tags | wishlistCount | total
6 | Chuột không dây | 320000 | Điện tử | Giảm giá, Hàng mới | 1 | 1
Empty set
```

- `total` vẫn là 3 ở trang 2 vì cửa sổ tính trên mọi hàng khớp trước khi `LIMIT` cắt trang. Trang 3 (`offset` 4) không còn hàng nên in `Empty set`.
- Từ khóa `chuột` viết thường vẫn khớp "Chuột không dây" vì cột dùng collation `utf8mb4_unicode_ci` không phân biệt hoa thường.

**Bước 4. Chạy test của Lab 2.** Test chạy lại `src/sql/lab1_wishlists.sql` của bạn trước mỗi ca, rồi thêm một "Áo khoác" (`id` 9) cùng giá 199000 với Áo thun để thử cột phân xử.

```bash
npx vitest run tests/lab2.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

**Điểm kiểm tra Lab 2:**

- [ ] `productCards` trả 8 hàng; hàng `id` 1 có `tags` là `Bán chạy, Giảm giá` và `wishlistCount` là 2.
- [ ] `productsByTag` với `"Giảm giá"` trả `id` 1, 3, 6; hàng `id` 6 có `tags` là `Giảm giá, Hàng mới`.
- [ ] `storefrontPage` với `"Giảm giá" "t" 2 2` trả đúng một hàng Áo thun, `total` 3.
- [ ] `npx vitest run tests/lab2.test.js` in `Tests  8 passed (8)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Hàng Tai nghe có `tags` là `Bán chạy, Bán chạy, Giảm giá, Giảm giá` và `wishlistCount` 4 | Ghép thẳng `product_tags` và `wishlists` rồi mới `GROUP BY`: 2 nhãn nhân 2 lượt yêu thích thành 4 hàng | Gộp nhãn và lượt yêu thích trong hai CTE riêng rồi `LEFT JOIN` vào `products` |
| `productsByTag("Giảm giá")` cho hàng `id` 6 chỉ còn `Giảm giá`, mất `Hàng mới` | Lọc `WHERE t.name = ?` trên chính nhánh ghép dùng để nối nhãn nên các nhãn khác bị loại trước khi gộp | Lọc bằng `p.id IN (SELECT ...)` hoặc `EXISTS`, nhánh nối nhãn để nguyên |
| `total` bằng 1 ở mọi hàng | Dùng `COUNT(*)` trong `GROUP BY` thay cho `COUNT(*) OVER ()`, nên mỗi nhóm đếm chính nó | Dùng `COUNT(*) OVER ()` như Lesson 04 mục 3.1 |
| Test vẫn xanh dù `ORDER BY p.price DESC` thiếu `p.id`; giảng viên trừ điểm khi đọc mã | Trên 8 sản phẩm MySQL tình cờ trả theo `id`, nhưng thứ tự giữa các hàng cùng giá không được bảo đảm; Lesson 05 (Lỗi 1) cho thấy hàng lặp giữa các trang trên 200.000 sản phẩm | Viết `ORDER BY p.price DESC, p.id` |

---

## Lab 3 - Báo cáo quản trị: doanh thu, top bán chạy và view (15 phút)

**Tầng:** Bắt buộc
**Mức AI:** AI-0

**Áp dụng:** Lesson 03, Lesson 04

**Mục tiêu:** viết hai truy vấn báo cáo trong `src/sql/reports.js` bằng CTE và `RANK()`, rồi lưu báo cáo top bán chạy thành view `v_top_sellers` để trang quản trị đọc lại mà luôn thấy số liệu mới.

**Các bước thực hiện:**

**Bước 1. Nạp dữ liệu bổ sung.** Khối này lấy đúng dữ liệu của Lesson 04 (đơn 4, đơn 5) và thêm danh mục "Gia dụng" chưa có sản phẩm như Lesson 02 mục 3.3.

```bash
node scripts/sql.js file tests/fixtures/extra-orders.sql
```

Kết quả mong đợi:

```text
Query OK, 1 rows affected
Query OK, 2 rows affected
Query OK, 4 rows affected
```

**Bước 2. Doanh thu theo danh mục (`categoryRevenue`).** Không tham số; 4 cột `categoryId, categoryName, unitsSold, revenue` với `revenue` là tổng `quantity * unit_price`. Tính doanh số trong CTE rồi `LEFT JOIN` từ `categories` để giữ danh mục chưa bán (quy tắc R4); thứ tự `revenue` giảm dần, rồi `categoryId`.

```bash
node scripts/sql.js query reports categoryRevenue
```

Kết quả mong đợi:

```text
categoryId | categoryName | unitsSold | revenue
1 | Điện tử | 5 | 2430000
2 | Thời trang | 4 | 2238000
3 | Sách | 3 | 580000
4 | Gia dụng | 0 | 0
```

**Bước 3. Top 2 bán chạy mỗi danh mục (`topSellers`).** Không tham số; 5 cột `categoryId, productId, productName, sold, rankNo`; xếp hạng theo tổng số lượng bán trong từng danh mục, đồng hạng cùng được lấy (Lesson 04 mục 3.2); thứ tự `categoryId, rankNo, productId`.

```bash
node scripts/sql.js query reports topSellers
```

Kết quả mong đợi:

```text
categoryId | productId | productName | sold | rankNo
1 | 1 | Tai nghe Bluetooth | 2 | 1
1 | 6 | Chuột không dây | 2 | 1
2 | 3 | Áo thun | 2 | 1
2 | 4 | Giày chạy bộ | 1 | 2
2 | 7 | Quần jeans | 1 | 2
3 | 8 | Sách Cơ sở dữ liệu | 2 | 1
3 | 5 | Sách Lập trình | 1 | 2
```

**Bước 4. Lưu thành view.** Viết `CREATE VIEW v_top_sellers` trong `src/sql/lab3_views.sql` với cùng 5 cột của `topSellers` (không cần `ORDER BY` trong view), chạy tệp rồi đọc view cho danh mục Thời trang.

```bash
node scripts/sql.js file src/sql/lab3_views.sql
node scripts/sql.js exec "SELECT * FROM v_top_sellers WHERE categoryId = 2 ORDER BY rankNo, productId"
```

Kết quả mong đợi:

```text
Query OK, 0 rows affected
Query OK, 0 rows affected
categoryId | productId | productName | sold | rankNo
2 | 3 | Áo thun | 2 | 1
2 | 4 | Giày chạy bộ | 1 | 2
2 | 7 | Quần jeans | 1 | 2
```

**Bước 5. Chạy test của Lab 3.**

```bash
npx vitest run tests/lab3.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

**Điểm kiểm tra Lab 3:**

- [ ] `categoryRevenue` trả 4 hàng; Điện tử 5 sản phẩm bán, doanh thu 2430000; Gia dụng 0 và 0.
- [ ] `topSellers` trả 7 hàng; Thời trang có Giày chạy bộ và Quần jeans cùng `rankNo` 2; Bàn phím cơ (`id` 2) không có mặt.
- [ ] `SELECT * FROM v_top_sellers WHERE categoryId = 2` trả 3 hàng như Bước 4.
- [ ] `npx vitest run tests/lab3.test.js` in `Tests  5 passed (5)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Thời trang chỉ còn 2 dòng (Áo thun, Giày chạy bộ), test top bán chạy đỏ | Dùng `ROW_NUMBER()` nên Quần jeans hạng 3 dù bán bằng Giày chạy bộ (Lesson 04, Lỗi 2) | Dùng `RANK()` |
| `ERROR 1054 (42S22): Unknown column 'rank_no' in 'where clause'` | Lọc hạng ngay trong câu có hàm cửa sổ, `WHERE` chạy trước khi hạng được tính (Lesson 04, Lỗi 1) | Tính hạng trong CTE, lọc `rank_no <= 2` ở truy vấn ngoài |
| Báo cáo doanh thu chỉ có 3 danh mục, mất Gia dụng | `INNER JOIN` giữa `categories` và CTE doanh số | `LEFT JOIN` từ `categories` và `COALESCE(..., 0)` |
| `ERROR 1050 (42S01): Table 'v_top_sellers' already exists` khi chạy lại tệp | Xóa dòng `DROP VIEW IF EXISTS` ở đầu tệp | Giữ dòng đó |

---

## Lab 4 - Index ghép, EXPLAIN và trang keyset (15 phút)

**Tầng:** Bắt buộc
**Mức AI:** AI-0

**Áp dụng:** Lesson 05

**Mục tiêu:** viết truy vấn trang danh mục, đọc `EXPLAIN` trước và sau khi tạo index ghép `idx_products_category_price`, rồi viết trang kế tiếp kiểu keyset không bỏ sót và không lặp hàng khi có giá trùng.

**Các bước thực hiện:**

**Bước 1. Nạp sách mới và viết trang đầu (`categoryFirstPage`).** Dữ liệu bổ sung thêm 4 đầu sách, trong đó 3 cuốn cùng giá 160000. Trong `src/sql/catalog.js`, viết `categoryFirstPage` với tham số `[categoryId, limit]`, 3 cột `id, name, price`, thứ tự theo quy tắc R5.

```bash
node scripts/sql.js file tests/fixtures/extra-books.sql
node scripts/sql.js query catalog categoryFirstPage 3 2
```

Kết quả mong đợi:

```text
Query OK, 4 rows affected
id | name | price
5 | Sách Lập trình | 160000
10 | Sách Express | 160000
```

**Bước 2. Đọc EXPLAIN trước khi có index.**

```bash
node scripts/sql.js explain catalog categoryFirstPage 3 2
```

Kết quả mong đợi:

```text
id | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra
1 | SIMPLE | products | NULL | ref | fk_products_category | fk_products_category | 4 | const | 6 | 100 | Using filesort
```

- MySQL lọc được danh mục nhờ index của khóa ngoại nhưng vẫn phải sắp xếp thêm (`Using filesort`), như Lesson 05 mục 2.2.

**Bước 3. Tạo index ghép và đọc lại EXPLAIN.** Viết lệnh `CREATE INDEX idx_products_category_price` trong `src/sql/lab4_indexes.sql`; cột lọc đứng trước, cột sắp xếp đứng sau.

```bash
node scripts/sql.js file src/sql/lab4_indexes.sql
node scripts/sql.js explain catalog categoryFirstPage 3 2
```

Kết quả mong đợi:

```text
Query OK, 0 rows affected
id | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra
1 | SIMPLE | products | NULL | ref | idx_products_category_price | idx_products_category_price | 4 | const | 6 | 100 | NULL
```

- `Extra` từ `Using filesort` thành `NULL`: index đã sắp sẵn theo `price`, InnoDB gắn `id` cuối mỗi mục nên `ORDER BY price, id` đọc thẳng index.

**Bước 4. Trang kế tiếp kiểu keyset (`categoryNextPage`).** Tham số `[categoryId, lastPrice, lastPrice, lastId, limit]` là giá và `id` của hàng cuối trang trước; không dùng `OFFSET` (Lesson 05 mục 2.3). Đi trang 2, trang 3 và trang 4 của danh mục Sách.

```bash
node scripts/sql.js query catalog categoryNextPage 3 160000 160000 10 2
node scripts/sql.js query catalog categoryNextPage 3 175000 175000 9 2
node scripts/sql.js query catalog categoryNextPage 3 210000 210000 12 2
```

Kết quả mong đợi:

```text
id | name | price
11 | Sách MySQL | 160000
9 | Sách Node.js | 175000
id | name | price
8 | Sách Cơ sở dữ liệu | 210000
12 | Sách Git | 210000
Empty set
```

**Bước 5. Chạy test của Lab 4.**

```bash
npx vitest run tests/lab4.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

**Điểm kiểm tra Lab 4:**

- [ ] Trước khi tạo index, `EXPLAIN` của `categoryFirstPage 3 2` có `key` là `fk_products_category` và `Extra` là `Using filesort`; sau đó `key` là `idx_products_category_price`, `Extra` là `NULL`.
- [ ] `categoryNextPage 3 160000 160000 10 2` trả `id` 11 rồi 9 (Sách MySQL cùng giá 160000 không bị bỏ sót).
- [ ] Ba trang đi liên tiếp cho `id` 5, 10, 11, 9, 8, 12, trang thứ tư là `Empty set`.
- [ ] `npx vitest run tests/lab4.test.js` in `Tests  6 passed (6)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Trang 2 sau (160000, 10) trả `id` 9, 8, mất Sách MySQL (`id` 11) | Keyset chỉ viết `price > ?`, bỏ nhánh cùng giá mà `id` lớn hơn | Viết `price > ? OR (price = ? AND id > ?)` |
| Trang sau (160000, 10) trả lại đúng trang 1 (`id` 5, 10), đi trang mãi không hết | Viết `price >= ?` thay `price > ?` nên mọi hàng cùng giá 160000 quay lại | Dùng đúng dấu `>` ở vế đầu |
| `EXPLAIN` vẫn có `key` là `fk_products_category` và `Extra` là `Using filesort` dù đã tạo index | Index đặt cột theo thứ tự `(price, category_id)`, không khớp tiền tố trái nhất `category_id` (Lesson 05 mục 2.2) | Tạo index `(category_id, price)` |
| `ERROR 1061 (42000): Duplicate key name 'idx_products_category_price'` | Chạy lại `lab4_indexes.sql` khi index đã có | Chạy `npm run db:setup` rồi nạp lại dữ liệu của bước 1 trước khi chạy lại tệp |

---

## Lab 5 - Phản biện procedure đặt hàng do AI sinh (20 phút)

**Tầng:** Bắt buộc
**Mức AI:** AI-2

**Áp dụng:** Lesson 06, Lesson 07

**Mục tiêu:** kiểm chứng procedure `sp_place_order` do trợ lý AI sinh bằng bộ test có sẵn, chỉ ra dòng gây sai và nguyên nhân của từng test đỏ, sửa cho đủ quy tắc R6 và ghi nhật ký giữ – sửa – loại bỏ.

Anh Hùng đã gửi trợ lý AI đặc tả dưới đây; mã nhận về nằm nguyên văn trong `src/sql/lab5_place_order.sql`.

| Mục | Đặc tả của `sp_place_order(IN p_user_id, IN p_product_id, IN p_quantity, OUT p_order_id)` |
|---|---|
| Đầu vào | Mã khách, mã sản phẩm, số lượng (`INT UNSIGNED`) |
| Đầu ra | `p_order_id` là mã đơn vừa tạo; `orders.total` bằng giá nhân số lượng; một dòng `order_items` với `unit_price` là giá sản phẩm lúc đặt |
| Số lượng nhỏ hơn 1 | `SIGNAL SQLSTATE '45000'` với thông báo `Số lượng không hợp lệ`, không tạo đơn |
| Không đủ hàng | `SIGNAL SQLSTATE '45000'` với thông báo `Không đủ hàng trong kho`, không để lại đơn, dòng chi tiết hay kho đã trừ |
| Nhiều phiên cùng lúc | Không mất lượt trừ kho, không bán quá tồn kho |
| Dùng từ API | API gọi procedure qua pool `mysql2`, một kết nối được dùng lại cho nhiều lần gọi liên tiếp |

**Các bước thực hiện:**

**Bước 1. Nạp mã AI và chạy thử hai ca tay.** Nạp lại dữ liệu mẫu cho sạch, nạp procedure, cho Hùng đặt 2 Chuột không dây rồi cho Lan đặt Giày chạy bộ (kho 0).

```bash
npm run db:setup
node scripts/sql.js file src/sql/lab5_place_order.sql
node scripts/sql.js exec "CALL sp_place_order(3, 6, 2, @order_id); SELECT @order_id AS orderId"
node scripts/sql.js exec "SELECT o.id, o.user_id, o.total, oi.unit_price, p.stock FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.id = 4"
node scripts/sql.js exec "CALL sp_place_order(2, 4, 1, @order_id)"
```

Kết quả mong đợi (bỏ dòng của `npm run db:setup`):

```text
Query OK, 0 rows affected
Query OK, 0 rows affected
Query OK, 0 rows affected
orderId
4
id | user_id | total | unit_price | stock
4 | 3 | 640000 | 320000 | 38
ERROR 1644 (45000): Không đủ hàng trong kho
```

- Hai ca tay đều cho kết quả trông đúng. Mỗi lệnh `node scripts/sql.js` mở một kết nối riêng và đóng ngay khi xong, khác với pool của API ở dòng cuối của bảng đặc tả.

**Bước 2. Chạy bộ test của Lab 5 trên mã AI.**

```bash
npx vitest run tests/lab5.test.js
```

Kết quả mong đợi (dòng `FAIL`, dòng `AssertionError` của từng test đỏ và hai dòng tóm tắt):

```text
 FAIL  tests/lab5.test.js > Lab 5 - sp_place_order > Lan đặt Giày chạy bộ (kho 0): lỗi 1644 'Không đủ hàng trong kho', chính kết nối đó không còn đơn dở
AssertionError: expected 4 to be 3 // Object.is equality
 FAIL  tests/lab5.test.js > Lab 5 - sp_place_order > đặt lỗi rồi đặt tiếp trên cùng kết nối: chỉ đơn đặt thành công được lưu
AssertionError: expected [ { id: 4, userId: 2, …(1) }, …(1) ] to have a length of 1 but got 2
 FAIL  tests/lab5.test.js > Lab 5 - sp_place_order > số lượng 0 bị từ chối bằng lỗi 1644 'Số lượng không hợp lệ' và không tạo đơn
AssertionError: expected null to deeply equal { errno: 1644, …(1) }
 FAIL  tests/lab5.test.js > Lab 5 - sp_place_order > đặt hàng trong lúc phiên khác đang trừ kho chưa COMMIT: kho Bàn phím cơ 12 còn đúng 10
AssertionError: expected 11 to be 10 // Object.is equality
 Test Files  1 failed (1)
      Tests  4 failed | 2 passed (6)
```

**Bước 3. Truy từng test đỏ về dòng mã.** Mở `tests/lab5.test.js`, đọc ca thử của từng test đỏ, rồi với mỗi test trả lời ba câu và ghi vào nháp: (1) dòng nào của `lab5_place_order.sql` tạo ra giá trị sai; (2) vì sao dòng đó sai, đối chiếu Lesson 06 mục 2.1 đến 2.3 và Lesson 07 mục 2.1, 2.2; (3) sửa bằng cách nào mà không làm đỏ hai test đang xanh. Có thể thêm `SELECT` tạm vào test của riêng bạn để xem dữ liệu, nhưng không sửa `tests/lab5.test.js`.

```bash
npx vitest run tests/lab5.test.js -t "đặt hàng trong lúc phiên khác"
```

Kết quả mong đợi (chỉ chạy một test, 5 test còn lại bị bỏ qua):

```text
 FAIL  tests/lab5.test.js > Lab 5 - sp_place_order > đặt hàng trong lúc phiên khác đang trừ kho chưa COMMIT: kho Bàn phím cơ 12 còn đúng 10
AssertionError: expected 11 to be 10 // Object.is equality
 Test Files  1 failed (1)
      Tests  1 failed | 5 skipped (6)
```

**Bước 4. Sửa procedure và chạy lại test.** Sửa ngay trong `src/sql/lab5_place_order.sql`, giữ nguyên tên và chữ ký procedure.

```bash
npx vitest run tests/lab5.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  6 passed (6)
```

**Bước 5. Ghi nhật ký giữ – sửa – loại bỏ.** Điền bảng trong `docs/nhat_ky_ai.md`: mỗi đoạn mã bạn đã xét là một dòng gồm đoạn mã (kèm số dòng), quyết định (Giữ, Sửa hoặc Loại bỏ), lý do và bằng chứng (tên test hoặc lệnh đã chạy kèm kết quả thật). Ghi cả số test Lab 5 đạt trước và sau khi sửa.

```text
| Đoạn mã (dòng) | Quyết định | Lý do | Bằng chứng |
|---|---|---|---|
```

Kết quả mong đợi: `docs/nhat_ky_ai.md` có ít nhất một dòng cho mỗi test đỏ ở Bước 2 (mỗi dòng ghi đúng tên test đó ở cột bằng chứng), ít nhất một dòng "Giữ" cho đoạn mã đã đúng từ đầu, và dòng cuối ghi `Số test Lab 5 đạt trước khi sửa: 2 / 6. Sau khi sửa: 6 / 6.`

**Điểm kiểm tra Lab 5:**

- [ ] Trên mã AI chưa sửa, `npx vitest run tests/lab5.test.js` in `Tests  4 failed | 2 passed (6)`.
- [ ] Sau khi sửa, gọi `CALL sp_place_order(2, 1, 0, @order_id)` trả `ERROR 1644 (45000): Số lượng không hợp lệ`.
- [ ] Sau khi sửa, ca hai phiên cùng trừ Bàn phím cơ (kho 12, mỗi phiên 1 chiếc) để lại kho 10.
- [ ] `npx vitest run tests/lab5.test.js` in `Tests  6 passed (6)` và nhật ký có đủ dòng như Bước 5.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Sửa xong, test "đặt lỗi rồi đặt tiếp" xanh nhưng test "số lượng 0" vẫn đỏ | Mới xử lý nhánh hoàn tác, chưa đối chiếu hết từng dòng của bảng đặc tả | Đọc lại bảng đặc tả, mỗi dòng phải có một đoạn mã đáp ứng và một test làm bằng chứng |
| `ERROR 1064 (42000): You have an error in your SQL syntax; ... near 'DELIMITER //` khi chạy tệp | Thêm `DELIMITER //` như khi gõ trong client `mysql`; `mysql2` gửi nguyên văn cho máy chủ nên máy chủ không hiểu lệnh này (Lesson 07 mục 2.1) | Bỏ `DELIMITER`, giữ `END;` như tệp gốc |
| `ERROR 1304 (42000): PROCEDURE sp_place_order already exists` | Xóa dòng `DROP PROCEDURE IF EXISTS sp_place_order;` ở đầu tệp | Giữ dòng đó để mỗi lần chạy tệp là thay procedure cũ |

---

## Lab 6 - Nhật ký kho bằng trigger (20 phút)

**Tầng:** Nâng cao (tùy chọn)
**Mức AI:** AI-0

**Áp dụng:** Lesson 07

**Mục tiêu:** tạo bảng `inventory_logs` và trigger `trg_products_stock_log` ghi tồn kho cũ và mới mỗi khi `stock` đổi, dù thay đổi đến từ `sp_place_order` của Lab 5 hay từ lệnh nhập kho.

**Các bước thực hiện:**

**Bước 1. Viết bảng và trigger.** Trong `src/sql/lab6_inventory_logs.sql`, bảng `inventory_logs` có `id` tự tăng, `product_id` (khóa ngoại `fk_logs_product` tới `products`, xóa theo), `old_stock`, `new_stock` (`INT UNSIGNED NOT NULL`), `changed_at` (`DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`). Trigger chạy sau mỗi lần sửa một hàng của `products` và chỉ ghi khi `stock` đổi. Chạy trên dữ liệu sạch cùng procedure đã sửa ở Lab 5.

```bash
npm run db:setup
node scripts/sql.js file src/sql/lab5_place_order.sql
node scripts/sql.js file src/sql/lab6_inventory_logs.sql
node scripts/sql.js exec "CALL sp_place_order(3, 6, 2, @order_id)"
node scripts/sql.js exec "CALL sp_place_order(2, 2, 50, @order_id)"
node scripts/sql.js exec "UPDATE products SET stock = stock + 20 WHERE id = 4"
node scripts/sql.js exec "UPDATE products SET price = 430000 WHERE id = 1"
node scripts/sql.js exec "SELECT id, product_id, old_stock, new_stock FROM inventory_logs ORDER BY id"
```

Kết quả mong đợi (bỏ dòng của `npm run db:setup` và các dòng `Query OK, 0 rows affected` khi nạp hai tệp):

```text
Query OK, 0 rows affected
ERROR 1644 (45000): Không đủ hàng trong kho
Query OK, 1 rows affected
Query OK, 1 rows affected
id | product_id | old_stock | new_stock
1 | 6 | 40 | 38
2 | 4 | 0 | 20
```

- Đơn 50 Bàn phím cơ bị hoàn tác cùng mọi dòng nhật ký trigger đã ghi trong transaction đó; lệnh đổi giá không làm `stock` đổi nên không có dòng.

**Bước 2. Chạy test của Lab 6.**

```bash
npx vitest run tests/lab6.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

**Điểm kiểm tra Lab 6:**

- [ ] Sau `CALL sp_place_order(3, 6, 2, @order_id)`, `inventory_logs` có dòng `6 | 40 | 38`.
- [ ] Sau lệnh đổi giá Tai nghe thành 430000, số dòng nhật ký không đổi.
- [ ] `npx vitest run tests/lab6.test.js` in `Tests  5 passed (5)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Đổi giá Tai nghe cũng sinh một dòng nhật ký: sản phẩm 1, tồn cũ 25, tồn mới 25 | Trigger thiếu điều kiện `NEW.stock <> OLD.stock` | Bọc lệnh ghi nhật ký trong `IF ... END IF` |
| `ERROR 1442 (HY000): Can't update table 'products' in stored function/trigger because it is already used by statement which invoked this stored function/trigger.` | Trigger sửa lại chính bảng `products` (Lesson 07, Lỗi 1) | Trigger `AFTER UPDATE` chỉ ghi vào bảng khác |

---

## Lab 7 - Tìm kiếm FULLTEXT theo tên sản phẩm (15 phút)

**Tầng:** Nâng cao (tùy chọn)
**Mức AI:** AI-0

**Áp dụng:** Lesson 05

**Mục tiêu:** tạo index `FULLTEXT` với bộ tách ngram trên `products.name` và viết `searchProducts` tìm một cụm chữ liền nhau, phân trang kèm tổng.

**Các bước thực hiện:**

**Bước 1. Tạo index và viết truy vấn tìm kiếm.** Trong `src/sql/lab7_fulltext.sql` tạo `ft_products_name` (Lesson 05 mục 2.3). Trong `src/sql/catalog.js`, `searchProducts` nhận `[phrase, limit, offset]` với `phrase` không kèm dấu nháy; truy vấn tự đặt cụm này trong dấu nháy kép khi đưa vào `AGAINST (... IN BOOLEAN MODE)` để tìm đúng cụm liền nhau. Cột `id, name, price, total`, thứ tự `price, id`.

```bash
npm run db:setup
node scripts/sql.js file tests/fixtures/extra-books.sql
node scripts/sql.js file src/sql/lab7_fulltext.sql
node scripts/sql.js query catalog searchProducts "Sách" 2 2
node scripts/sql.js query catalog searchProducts "không dây" 10 0
```

Kết quả mong đợi (bỏ dòng của `npm run db:setup`):

```text
Query OK, 4 rows affected
Query OK, 0 rows affected
id | name | price | total
11 | Sách MySQL | 160000 | 6
9 | Sách Node.js | 175000 | 6
id | name | price | total
6 | Chuột không dây | 320000 | 1
```

**Bước 2. Chạy test của Lab 7.**

```bash
npx vitest run tests/lab7.test.js
```

Kết quả mong đợi:

```text
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

**Điểm kiểm tra Lab 7:**

- [ ] `searchProducts "Sách" 2 2` trả `id` 11 rồi 9, `total` 6.
- [ ] `searchProducts "không dây" 10 0` trả một hàng `id` 6, `total` 1.
- [ ] `npx vitest run tests/lab7.test.js` in `Tests  4 passed (4)`.

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Kết quả đúng nhưng test `EXPLAIN ... type fulltext` đỏ | Dùng `name LIKE CONCAT('%', ?, '%')`, không dùng được index (Lesson 05, Lỗi 2) | Dùng `MATCH (name) AGAINST (...)` |
| `ERROR 1191 (HY000): Can't find FULLTEXT index matching the column list` | Chạy truy vấn trước khi tạo `ft_products_name`, hoặc index đặt trên cột khác | Chạy `lab7_fulltext.sql` trước, index đúng cột `name` |

---

## Tổng kết (5 phút)

- Bảng nối có khóa ghép và khóa ngoại để MySQL tự từ chối dữ liệu sai (`1062`, `1452`); `CASCADE` của bảng con không vượt qua `RESTRICT` của bảng khác (`1451`).
- Ghép nhiều bảng con cùng lúc thì nhân dòng; gộp từng nhánh trong CTE rồi mới ghép. Lọc theo nhãn bằng truy vấn con để không làm mất nhãn khác.
- `COUNT(*) OVER ()` cho tổng số hàng khớp trước khi `LIMIT` cắt trang; `RANK()` giữ đồng hạng; view luôn đọc số liệu mới.
- Index ghép đặt cột lọc trước, cột sắp xếp sau; `EXPLAIN` hết `Using filesort` là bằng chứng. Keyset cần đủ hai vế `price > ? OR (price = ? AND id > ?)`.
- Mã AI chạy đúng ca tay chưa chắc đúng: chỉ bộ test bám đặc tả (hoàn tác, ca biên, hai phiên đồng thời) mới làm lộ lỗi, và mỗi quyết định sửa cần một bằng chứng ghi lại.

## Rubric chấm lab (10 điểm)

| Phần | Tiêu chí | Điểm |
|---|---|---|
| Lab 1 | 8/8 test `lab1` xanh; hai khóa ngoại đúng tên `fk_wishlists_user`, `fk_wishlists_product` | 1,5 |
| Lab 2 | 8/8 test `lab2` xanh; nhãn và lượt yêu thích gộp riêng từng nhánh | 2 |
| Lab 3 | 5/5 test `lab3` xanh; `v_top_sellers` chạy lại không lỗi | 1,5 |
| Lab 4 | 6/6 test `lab4` xanh; ảnh hoặc bản chép `EXPLAIN` trước và sau khi tạo index | 1,5 |
| Lab 5 | 6/6 test `lab5` xanh (1,5 điểm); nhật ký đủ dòng cho từng test đỏ, mỗi dòng có bằng chứng thật (1 điểm) | 2,5 |
| Lab 6 (nâng cao) | Ghi nhận, không tính điểm | 0 |
| Lab 7 (nâng cao) | Ghi nhận, không tính điểm | 0 |
| Chất lượng mã | Tham số `?`, không nối chuỗi; `ORDER BY` có cột phân xử; bí danh `camelCase` đúng thứ tự; thụt lề 4 khoảng trắng; không sửa `tests/`, `db/` | 1 |
| Cộng | | 10 |

## Tự học thêm (không kiểm tra, không đưa vào lab)

- Công cụ migration lược đồ (Flyway, Knex migrate).
- ORM cho Node.js (Prisma, Sequelize).
- Bộ nhớ đệm Redis cho trang cửa hàng.
- Phân vùng bảng (`PARTITION BY RANGE`).
- Sao lưu và phục hồi bằng `mysqldump`.

## Phụ lục - Danh sách tệp theo từng lab

| Lab | Tệp | Nội dung |
|---|---|---|
| 1 | `src/sql/lab1_wishlists.sql` | `CREATE TABLE wishlists` và 5 lượt yêu thích mẫu |
| 1 | `tests/lab1.test.js` | 8 test ràng buộc khóa |
| 2 | `src/sql/storefront.js` | `productCards`, `productsByTag`, `storefrontPage` |
| 2 | `tests/lab2.test.js` | 8 test trang cửa hàng |
| 3 | `tests/fixtures/extra-orders.sql` | Danh mục Gia dụng, đơn 4 và đơn 5 |
| 3 | `src/sql/reports.js` | `categoryRevenue`, `topSellers` |
| 3 | `src/sql/lab3_views.sql` | `CREATE VIEW v_top_sellers` |
| 3 | `tests/lab3.test.js` | 5 test báo cáo và view |
| 4 | `tests/fixtures/extra-books.sql` | 4 đầu sách mới, giá trùng nhau |
| 4 | `src/sql/lab4_indexes.sql` | `CREATE INDEX idx_products_category_price` |
| 4 | `src/sql/catalog.js` | `categoryFirstPage`, `categoryNextPage` |
| 4 | `tests/lab4.test.js` | 6 test index và keyset |
| 5 | `src/sql/lab5_place_order.sql` | Procedure `sp_place_order` (mã AI, bạn sửa tại chỗ) |
| 5 | `docs/nhat_ky_ai.md` | Nhật ký giữ – sửa – loại bỏ |
| 5 | `tests/lab5.test.js` | 6 test đặt hàng |
| 6 | `src/sql/lab6_inventory_logs.sql` | Bảng `inventory_logs`, trigger `trg_products_stock_log` |
| 6 | `tests/lab6.test.js` | 5 test nhật ký kho |
| 7 | `src/sql/lab7_fulltext.sql` | `CREATE FULLTEXT INDEX ft_products_name` |
| 7 | `src/sql/catalog.js` | `searchProducts` |
| 7 | `tests/lab7.test.js` | 4 test tìm kiếm |
| Chung | `scripts/sql.js` | Chạy tệp `.sql`, truy vấn xuất, `EXPLAIN` trên `rikkei_shop_sql` |
