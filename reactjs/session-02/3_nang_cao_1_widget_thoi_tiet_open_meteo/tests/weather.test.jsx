import { act, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installOpenMeteo } from "./open-meteo-fake.js";
import { getForecast, getWeatherErrorMessage, searchCity } from "../src/api/weather.js";
import { describeWeather } from "../src/api/weatherCodes.js";
import useFetch from "../src/hooks/useFetch.js";
import WeatherWidget from "../src/components/WeatherWidget.jsx";

const GEOCODING = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const forecastCalls = () => window.mockApi.calls.filter((call) => call.url.startsWith(FORECAST));
const searchCalls = () => window.mockApi.calls.filter((call) => call.url.startsWith(GEOCODING));

// Bắt lỗi của một lời hứa để kiểm tra thông báo.
async function catchError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return undefined;
}

beforeEach(() => {
  installOpenMeteo();
});

describe("describeWeather: mã thời tiết WMO", () => {
  test("đổi mã WMO thành mô tả tiếng Việt, mã lạ là Không xác định", () => {
    const table = {
      0: "Trời quang",
      1: "Ít mây",
      2: "Mây rải rác",
      3: "Nhiều mây",
      45: "Sương mù",
      48: "Sương mù",
      51: "Mưa phùn",
      53: "Mưa phùn",
      55: "Mưa phùn",
      61: "Mưa",
      63: "Mưa",
      65: "Mưa",
      80: "Mưa rào",
      81: "Mưa rào",
      82: "Mưa rào",
      95: "Dông",
      96: "Dông",
      99: "Dông",
    };
    Object.entries(table).forEach(([code, text]) => {
      expect(describeWeather(Number(code))).toBe(text);
    });
    expect(describeWeather(4)).toBe("Không xác định");
    expect(describeWeather(999)).toBe("Không xác định");
    expect(describeWeather(undefined)).toBe("Không xác định");
  });
});

describe("Lớp API weather.js", () => {
  test("searchCity gửi name, count=5, language=vi và trả mảng kết quả", async () => {
    const results = await searchCity("Cần Thơ");
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(5);
    expect(results[0].name).toBe("Cần Thơ");
    expect(results[0].latitude).toBeCloseTo(10.03711, 3);
    const call = searchCalls()[0];
    expect(call.method).toBe("GET");
    expect(call.query).toMatchObject({ name: "Cần Thơ", count: "5", language: "vi" });
  });

  test("searchCity trả mảng rỗng khi phản hồi không có khóa results", async () => {
    const results = await searchCity("Xyzabc");
    expect(results).toEqual([]);
  });

  test("getForecast gửi tọa độ, biến current, biến daily, timezone và forecast_days", async () => {
    await getForecast({ latitude: 21.0245, longitude: 105.84117 });
    await getForecast({ latitude: 21.0245, longitude: 105.84117, days: 3 });
    const [first, second] = forecastCalls();
    expect(first.query).toMatchObject({
      latitude: "21.0245",
      longitude: "105.84117",
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      timezone: "auto",
      forecast_days: "5",
    });
    expect(second.query.forecast_days).toBe("3");
  });

  test("getForecast trả { current, days } với tên trường gọn của ứng dụng", async () => {
    const forecast = await getForecast({ latitude: 21.0245, longitude: 105.84117 });
    expect(forecast.current).toEqual({ temperature: 25.9, humidity: 86, wind: 5.4, code: 3 });
    expect(forecast.days).toHaveLength(5);
    expect(forecast.days[0]).toEqual({ date: "2026-11-06", max: 30.1, min: 23.5, code: 95 });
    expect(forecast.days[4]).toEqual({ date: "2026-11-10", max: 23.2, min: 18, code: 3 });
  });

  test("getWeatherErrorMessage: 500 là sự cố máy chủ, 400 kèm lý do của máy chủ", async () => {
    window.mockApi.fail(FORECAST, { status: 500, times: 1 });
    const serverError = await catchError(getForecast({ latitude: 21.0245, longitude: 105.84117 }));
    expect(getWeatherErrorMessage(serverError)).toBe("Máy chủ thời tiết đang gặp sự cố, hãy thử lại sau.");

    const badRequest = await catchError(getForecast({ latitude: 999, longitude: 105 }));
    expect(getWeatherErrorMessage(badRequest)).toBe(
      "Yêu cầu không hợp lệ: Latitude must be in range of -90 to 90°. Given: 999.0."
    );
  });

  test("getWeatherErrorMessage: mất mạng, và lỗi tự ném thì giữ nguyên nội dung", async () => {
    window.mockApi.networkError(FORECAST, 1);
    const networkError = await catchError(getForecast({ latitude: 21.0245, longitude: 105.84117 }));
    expect(getWeatherErrorMessage(networkError)).toBe("Không kết nối được máy chủ thời tiết.");
    expect(getWeatherErrorMessage(new Error("Không tìm thấy thành phố Huế."))).toBe("Không tìm thấy thành phố Huế.");
  });
});

describe("Hook useFetch", () => {
  test("bắt đầu ở trạng thái đang tải, xong thì có dữ liệu và hết đang tải", async () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve("xong"), []));
    expect(result.current).toEqual({ data: null, loading: true, error: null });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ data: "xong", loading: false, error: null });
  });

  test("lỗi 500 trở thành chuỗi thông báo tiếng Việt, không còn đang tải", async () => {
    window.mockApi.fail(FORECAST, { status: 500 });
    const { result } = renderHook(() =>
      useFetch((signal) => getForecast({ latitude: 21.0245, longitude: 105.84117 }, signal), [])
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Máy chủ thời tiết đang gặp sự cố, hãy thử lại sau.");
    expect(result.current.data).toBeNull();
  });

  test("đổi deps hủy yêu cầu cũ, xóa dữ liệu cũ và kết quả cũ về sau không đè kết quả mới", async () => {
    const calls = [];
    const makeFetcher = (label) => (signal) =>
      new Promise((resolve) => {
        calls.push({ label, signal, resolve });
      });
    const { result, rerender } = renderHook(({ id }) => useFetch(makeFetcher(id), [id]), {
      initialProps: { id: "a" },
    });
    expect(calls).toHaveLength(1);
    await act(async () => {
      calls[0].resolve("Kết quả A");
    });
    expect(result.current.data).toBe("Kết quả A");

    // Đổi deps: dữ liệu cũ bị xóa, đang tải trở lại, deps không đổi thì không gọi lại.
    rerender({ id: "b" });
    expect(calls).toHaveLength(2);
    expect(result.current).toEqual({ data: null, loading: true, error: null });
    rerender({ id: "b" });
    expect(calls).toHaveLength(2);

    // Đổi deps lần nữa khi yêu cầu b chưa xong: yêu cầu b bị hủy.
    rerender({ id: "c" });
    expect(calls).toHaveLength(3);
    expect(calls[1].signal.aborted).toBe(true);
    expect(calls[2].signal.aborted).toBe(false);

    await act(async () => {
      calls[2].resolve("Kết quả C");
    });
    expect(result.current.data).toBe("Kết quả C");
    await act(async () => {
      calls[1].resolve("Kết quả B");
    });
    expect(result.current.data).toBe("Kết quả C");
  });

  test("lỗi do hủy yêu cầu khi đổi deps không bị coi là lỗi", async () => {
    window.mockApi.delay(FORECAST, 600);
    const coordinates = { hanoi: [21.0245, 105.84117], danang: [16.06778, 108.22083] };
    const { result, rerender } = renderHook(
      ({ city }) =>
        useFetch(
          (signal) => getForecast({ latitude: coordinates[city][0], longitude: coordinates[city][1] }, signal),
          [city]
        ),
      { initialProps: { city: "hanoi" } }
    );
    await waitFor(() => expect(forecastCalls()).toHaveLength(1));
    rerender({ city: "danang" });
    await act(async () => {
      await sleep(40);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data).not.toBeNull(), { timeout: 3000 });
    expect(result.current.data.current.temperature).toBe(28.4);
    expect(result.current.error).toBeNull();
  });
});

describe("WeatherWidget: thời tiết văn phòng", () => {
  test("hiện Đang tải thời tiết..., rồi thời tiết hiện tại của Hà Nội (văn phòng mặc định)", async () => {
    const { container } = render(<WeatherWidget />);
    expect(screen.getByText("Đang tải thời tiết...")).toBeInTheDocument();
    expect(container.querySelector(".spinner-border")).toBeInTheDocument();
    expect(screen.getByLabelText("Văn phòng")).toHaveValue("Hà Nội");
    expect(await screen.findByText("Hà Nội: 25,9°C, Nhiều mây")).toBeInTheDocument();
    expect(screen.getByText("Độ ẩm: 86%")).toBeInTheDocument();
    expect(screen.getByText("Gió: 5,4 km/h")).toBeInTheDocument();
    expect(screen.queryByText("Đang tải thời tiết...")).not.toBeInTheDocument();
  });

  test("hiện dự báo 5 ngày và ghi nguồn Open-Meteo.com", async () => {
    render(<WeatherWidget />);
    const list = await screen.findByRole("list", { name: "Dự báo 5 ngày" });
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "06/11: 24°C - 30°C, Dông",
      "07/11: 23°C - 29°C, Mưa phùn",
      "08/11: 22°C - 30°C, Mưa rào",
      "09/11: 18°C - 23°C, Mưa rào",
      "10/11: 18°C - 23°C, Nhiều mây",
    ]);
    expect(screen.getByText("Dữ liệu thời tiết: Open-Meteo.com")).toBeInTheDocument();
  });

  test("danh sách Văn phòng có 4 thành phố, chọn TP. Hồ Chí Minh hiện thời tiết của thành phố đó", async () => {
    const user = userEvent.setup();
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    const select = screen.getByLabelText("Văn phòng");
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Hà Nội",
      "Đà Nẵng",
      "TP. Hồ Chí Minh",
      "Huế",
    ]);
    await user.selectOptions(select, "TP. Hồ Chí Minh");
    expect(await screen.findByText("TP. Hồ Chí Minh: 30,9°C, Nhiều mây")).toBeInTheDocument();
    expect(screen.getByText("Độ ẩm: 63%")).toBeInTheDocument();
    expect(screen.getByText("Gió: 5,8 km/h")).toBeInTheDocument();
    expect(screen.queryByText(/^Hà Nội:/)).not.toBeInTheDocument();
  });

  test("mở trang chỉ gửi một yêu cầu tìm thành phố và một yêu cầu dự báo", async () => {
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    await act(async () => {
      await sleep(100);
    });
    expect(searchCalls()).toHaveLength(1);
    expect(searchCalls()[0].query.name).toBe("Hà Nội");
    expect(forecastCalls()).toHaveLength(1);
    expect(forecastCalls()[0].query.forecast_days).toBe("5");
  });

  test("đổi văn phòng nhanh: kết quả của yêu cầu cũ không đè kết quả mới", async () => {
    const user = userEvent.setup();
    // Dự báo của Hà Nội (vĩ độ trên 20) về chậm 800 ms, dự báo các nơi khác về ngay.
    window.mockApi.delay((req) => req.host === "api.open-meteo.com" && Number(req.query.latitude) > 20, 800);
    render(<WeatherWidget />);
    await waitFor(() => expect(forecastCalls()).toHaveLength(1));
    await user.selectOptions(screen.getByLabelText("Văn phòng"), "Đà Nẵng");
    expect(await screen.findByText("Đà Nẵng: 28,4°C, Nhiều mây")).toBeInTheDocument();
    await act(async () => {
      await sleep(1100);
    });
    expect(screen.getByText("Đà Nẵng: 28,4°C, Nhiều mây")).toBeInTheDocument();
    expect(screen.queryByText(/^Hà Nội:/)).not.toBeInTheDocument();
  });

  test("máy chủ lỗi 500: hiện thông báo trong role=alert, kèm nút Thử lại", async () => {
    window.mockApi.fail(FORECAST, { status: 500 });
    render(<WeatherWidget />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Máy chủ thời tiết đang gặp sự cố, hãy thử lại sau.");
    expect(alert).toHaveClass("alert", "alert-danger");
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(screen.queryByText("Đang tải thời tiết...")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Hà Nội:/)).not.toBeInTheDocument();
  });

  test("máy chủ trả 400: hiện lý do reason của máy chủ", async () => {
    window.mockApi.fail(FORECAST, {
      status: 400,
      body: { error: true, reason: "Latitude must be in range of -90 to 90°. Given: 999.0." },
    });
    render(<WeatherWidget />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Yêu cầu không hợp lệ: Latitude must be in range of -90 to 90°. Given: 999.0."
    );
  });

  test("mất mạng: hiện Không kết nối được máy chủ thời tiết.", async () => {
    window.mockApi.networkError(FORECAST);
    render(<WeatherWidget />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Không kết nối được máy chủ thời tiết.");
  });

  test("bấm Thử lại sau lỗi thì gọi lại và hiện thời tiết", async () => {
    const user = userEvent.setup();
    window.mockApi.fail(FORECAST, { status: 500, times: 1 });
    render(<WeatherWidget />);
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("Hà Nội: 25,9°C, Nhiều mây")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(forecastCalls()).toHaveLength(2);
  });

  test("không tìm được tọa độ văn phòng: hiện Không tìm thấy thành phố <tên>.", async () => {
    window.mockApi.respond(GEOCODING, () => ({ status: 200, body: { generationtime_ms: 0.1 } }));
    render(<WeatherWidget />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Không tìm thấy thành phố Hà Nội.");
    expect(forecastCalls()).toHaveLength(0);
  });
});

describe("WeatherWidget: tìm thành phố khác", () => {
  test("tìm Hue hiện tối đa 5 kết quả dạng nút và gửi count=5, language=vi", async () => {
    const user = userEvent.setup();
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    await user.type(screen.getByLabelText("Tên thành phố"), "Hue");
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    const list = await screen.findByRole("list", { name: "Kết quả tìm kiếm" });
    const buttons = within(list).getAllByRole("button");
    expect(buttons).toHaveLength(5);
    expect(buttons[0]).toHaveTextContent("Huế, Việt Nam");
    expect(buttons[1]).toHaveTextContent("Huelva, Tây Ban Nha");
    const call = searchCalls().find((item) => item.query.name === "Hue");
    expect(call.query).toMatchObject({ count: "5", language: "vi" });
  });

  test("chọn một kết quả thì widget hiện thời tiết của thành phố đó", async () => {
    const user = userEvent.setup();
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    await user.type(screen.getByLabelText("Tên thành phố"), "Cần Thơ");
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    await user.click(await screen.findByRole("button", { name: "Cần Thơ, Việt Nam" }));
    expect(await screen.findByText("Cần Thơ: 29,5°C, Nhiều mây")).toBeInTheDocument();
    expect(screen.getByText("Độ ẩm: 73%")).toBeInTheDocument();
    expect(screen.getByText("Gió: 12,5 km/h")).toBeInTheDocument();
    expect(screen.queryByText(/^Hà Nội:/)).not.toBeInTheDocument();
    const lastForecast = forecastCalls().at(-1);
    expect(Number(lastForecast.query.latitude)).toBeCloseTo(10.03711, 3);
  });

  test("tìm tên không có kết quả: hiện Không tìm thấy thành phố <tên>.", async () => {
    const user = userEvent.setup();
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    await user.type(screen.getByLabelText("Tên thành phố"), "Xyzabc");
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    const notFound = await screen.findByText("Không tìm thấy thành phố Xyzabc.");
    expect(notFound).toHaveClass("alert", "alert-warning");
    expect(screen.queryByRole("list", { name: "Kết quả tìm kiếm" })).not.toBeInTheDocument();
  });

  test("ô tìm để trống hoặc toàn dấu cách thì không gửi yêu cầu tìm", async () => {
    const user = userEvent.setup();
    render(<WeatherWidget />);
    await screen.findByText("Hà Nội: 25,9°C, Nhiều mây");
    const before = searchCalls().length;
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    await user.type(screen.getByLabelText("Tên thành phố"), "   ");
    await user.click(screen.getByRole("button", { name: "Tìm" }));
    await act(async () => {
      await sleep(50);
    });
    expect(searchCalls()).toHaveLength(before);
    expect(screen.queryByRole("list", { name: "Kết quả tìm kiếm" })).not.toBeInTheDocument();
  });
});
