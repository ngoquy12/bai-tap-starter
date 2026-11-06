// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import axios from "axios";

// Open-Meteo không tìm thấy "TP. Hồ Chí Minh" (có tiền tố "TP."), nên bỏ tiền tố trước khi tìm.
export function toSearchName(city) {
  return city.replace(/^TP\.\s*/, "");
}

// Tìm thành phố theo tên (Open-Meteo, chỉ đọc). Trả mảng kết quả, [] khi phản hồi không có khóa results.
export async function searchCity(name, signal) {
  const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: { name, count: 5, language: "vi" },
    signal,
  });
  return response.data.results || [];
}

// Dự báo theo tọa độ. Trả { current: { temperature, humidity, wind, code }, days: [{ date, max, min, code }] }.
export async function getForecast({ latitude, longitude, days = 5 }, signal) {
  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      timezone: "auto",
      forecast_days: days,
    },
    signal,
  });
  const data = response.data;
  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
      code: data.current.weather_code,
    },
    days: data.daily.time.map((date, i) => ({
      date,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      code: data.daily.weather_code[i],
    })),
  };
}

// Mô tả mã thời tiết WMO bằng tiếng Việt.
export function describeWeather(code) {
  const table = {
    0: "Trời quang", 1: "Ít mây", 2: "Mây rải rác", 3: "Nhiều mây", 45: "Sương mù", 48: "Sương mù",
    51: "Mưa phùn", 53: "Mưa phùn", 55: "Mưa phùn", 61: "Mưa", 63: "Mưa", 65: "Mưa",
    80: "Mưa rào", 81: "Mưa rào", 82: "Mưa rào", 95: "Dông", 96: "Dông", 99: "Dông",
  };
  return table[code] || "Không xác định";
}
