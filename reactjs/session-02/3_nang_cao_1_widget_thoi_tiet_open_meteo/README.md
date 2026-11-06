# Bài 3 - Widget thời tiết văn phòng với Open-Meteo (Task Hub)

Dự án Vite + React 18.3.1 + Vitest. Đọc đề ở `de_bai_bai_tap.md`.

## Cách chạy

```bash
npm install
npm run dev     # chạy ứng dụng, cần Internet để gọi Open-Meteo thật
npm test        # chạy test tự chấm (dùng Open-Meteo giả, không cần Internet)
```

Bài này không cần `npm run seed`.

## Giao diện mẫu

Mở `giao_dien_mau/index.html` bằng trình duyệt để xem giao diện cần làm (HTML + Bootstrap 5.3.3). Chuyển từng khối sang JSX bằng https://transform.tools/html-to-jsx rồi tách component theo chú thích `Component` trong tệp mẫu; các bước chi tiết ở mục 2 của đề.

## Tệp cần làm

- `src/components/ForecastList.jsx`
- `src/components/CitySearch.jsx`
- `src/api/weatherCodes.js`
- `src/api/weather.js`
- `src/hooks/useFetch.js`
- `src/components/WeatherWidget.jsx`

## Tệp không được sửa

Thư mục `tests/`, `giao_dien_mau/` (chỉ để tham khảo), `src/App.jsx`, `src/config.js`, `src/utils/`, `src/data/`, các component còn lại trong `src/components/` (bảng công việc). Khối mã giữa `// ===== Mã nền (có sẵn, KHÔNG sửa) =====` và `// ===== HẾT MÃ NỀN =====`, hoặc cả tệp có dòng đầu `// ===== Mã nền (có sẵn, KHÔNG sửa) =====`, là mã nền.

## Giao diện mẫu trên GitHub

Giao diện mẫu của bài cũng có trên GitHub: https://github.com/ngoquy12/reactjs-giao-dien-mau/tree/main/session-02/bai-3-widget-thoi-tiet-open-meteo. Clone cả repo bằng `git clone https://github.com/ngoquy12/reactjs-giao-dien-mau.git` rồi mở `session-02/bai-3-widget-thoi-tiet-open-meteo/index.html` bằng trình duyệt.
