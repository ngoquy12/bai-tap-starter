// ===== BÀI LÀM: gọi Open-Meteo (tìm thành phố, dự báo) và đổi lỗi thành thông báo tiếng Việt =====

// TODO: gọi API tìm thành phố, trả MẢNG kết quả (mảng rỗng khi phản hồi không có khóa `results`).
export async function searchCity(name, signal) {
  throw new Error("Chưa làm searchCity");
}

// TODO: gọi API dự báo, trả { current: { temperature, humidity, wind, code }, days: [{ date, max, min, code }] }.
export async function getForecast({ latitude, longitude, days = 5 }, signal) {
  throw new Error("Chưa làm getForecast");
}

// TODO: đổi lỗi thành thông báo tiếng Việt theo bảng trong đề.
export function getWeatherErrorMessage(error) {
  return "";
}
