# Dự án nền (starter) cho bài tập ReactJS và NodeJS

Repo này chứa dự án nền của 24 bài tập về nhà: 12 bài ReactJS và 12 bài NodeJS (Express và MySQL). Mỗi thư mục là một dự án hoàn chỉnh để bạn tải về và làm tiếp. Repo KHÔNG chứa đáp án.

## Cách lấy dự án của bài bạn đang làm

```bash
git clone https://github.com/ngoquy12/bai-tap-starter.git
cd bai-tap-starter/<môn>/<session>/<thư mục bài>
```

Ví dụ bài 6 của buổi ReactJS lý thuyết:

```bash
cd bai-tap-starter/reactjs/session-01/6_sang_tao_quan_ly_nhan_vien_voi_api
```

Tên thư mục bài được ghi trong đề (mục "Dự án nền"). Sau khi vào thư mục bài, đọc `README.md` trong đó và làm theo.

## Cấu trúc

```
reactjs/
  session-01/   6 bài (buổi Lý thuyết ReactJS)
  session-02/   6 bài (buổi Thực hành ReactJS, ứng dụng Task Hub)
nodejs/
  session-01/   6 bài (buổi Lý thuyết NodeJS, Express và MySQL, Rikkei Shop)
  session-02/   6 bài (buổi Thực hành NodeJS, Rikkei Learn)
```

## Quy tắc

- Làm việc trên bản sao trong máy của bạn (hoặc bản sao đã đổi tên thư mục theo mẫu nộp bài ghi trong đề). Không sửa thư mục `tests`, các khối `Mã nền` và các tệp mà đề ghi là không được sửa.
- Bài ReactJS có API: lấy endpoint riêng tại https://crudcrud.com, dán vào `src/config.js`, chạy `npm run seed` một lần. Mỗi endpoint chỉ có 100 yêu cầu và hết hạn sau 24 giờ.
- Bài NodeJS cần MySQL 8 trên máy bạn: chép `.env.example` thành `.env`, điền thông tin MySQL, rồi chạy `npm install` và `npm run db:setup`.
- Không đưa tệp `.env` và thư mục `node_modules` vào bài nộp.
