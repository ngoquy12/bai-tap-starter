// ===== Mã nền (có sẵn, KHÔNG sửa) =====
import useFetch from "../hooks/useFetch.js";
import { describeWeather, getForecast, searchCity, toSearchName } from "../api/weather.js";

// Số theo định dạng Việt: 25.5 thành "25,5", 88 thành "88".
function formatNumber(value) {
  return String(Math.round(value * 10) / 10).replace(".", ",");
}

// Tìm tọa độ của thành phố rồi lấy dự báo. Ném lỗi thường khi không tìm thấy thành phố.
async function loadWeather(city, signal) {
  const places = await searchCity(toSearchName(city), signal);
  if (places.length === 0) throw new Error(`Không tìm thấy thành phố ${city}.`);
  return getForecast({ latitude: places[0].latitude, longitude: places[0].longitude, days: 1 }, signal);
}

// Thời tiết hiện tại của một thành phố (Open-Meteo). Nhận tên thành phố qua prop city.
function WeatherWidget(props) {
  const { data, loading, error } = useFetch((signal) => loadWeather(props.city, signal), [props.city]);

  return (
    <section className="card mb-3" aria-label="Thời tiết văn phòng">
      <div className="card-body">
        <h2 className="h5">Thời tiết văn phòng</h2>
        {loading && <p role="status" className="text-muted">Đang tải thời tiết...</p>}
        {error && <p role="alert" className="alert alert-danger">Không tải được thời tiết: {error}</p>}
        {data && (
          <div>
            <p className="mb-1">{props.city}: {formatNumber(data.current.temperature)}°C, {describeWeather(data.current.code)}</p>
            <p className="mb-1">Độ ẩm: {formatNumber(data.current.humidity)}%</p>
            <p className="mb-1">Gió: {formatNumber(data.current.wind)} km/h</p>
          </div>
        )}
        <small className="text-muted">Dữ liệu thời tiết: Open-Meteo.com</small>
      </div>
    </section>
  );
}

export default WeatherWidget;
